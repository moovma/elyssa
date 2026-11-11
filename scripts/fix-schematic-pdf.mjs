// Repairs the white hairline gaps in the Elyssa schematic PDF.
//
// Cause: the PDF draws every letter as hundreds of tiny separate triangles (one fill each). PDF viewers
// anti-alias each triangle on its own, so a faint white seam shows between neighbours, which looks like white
// segments inside the blue letters.
// Fix: merge every run of same-coloured triangles into a few big paths (all triangles wound the same way, filled
// once with the non-zero rule). The renderer then fills the union at once, so no seams, and the file also gets
// smaller and much faster to open. Shapes that have real holes are left exactly as they were.
//
//   node scripts/fix-schematic-pdf.mjs <input.pdf> [output.pdf]
//   npm run fix-schematic     (repairs public/elyssa_images/elyssa_schematic.pdf in place: run it after exporting a new schematic)
//
// Needs:  npm i -D pdf-lib   (already in this project's devDependencies when this script is used)
import fs from 'node:fs';
import { PDFDocument, PDFName, PDFArray, decodePDFRawStream } from 'pdf-lib';

const [inFile, outFile = inFile.replace(/\.pdf$/i, '.fixed.pdf')] = process.argv.slice(2);
if (!inFile) throw new Error('usage: node scripts/fix-schematic-pdf.mjs <input.pdf> [output.pdf]');

const pdf = await PDFDocument.load(fs.readFileSync(inFile), { updateMetadata: false });
const page = pdf.getPage(0);
const contents = page.node.Contents();
const refs = contents instanceof PDFArray ? contents.asArray() : [page.node.get(PDFName.of('Contents'))];
const text = Buffer.concat(refs.map((r) => Buffer.from(decodePDFRawStream(pdf.context.lookup(r)).decode()))).toString('latin1');
console.log(`input: ${(fs.statSync(inFile).size / 1048576).toFixed(2)} MB, content ${(text.length / 1048576).toFixed(1)} MB in ${refs.length} streams`);

const BLOCK = /q\n([\d.]+) ([\d.]+) ([\d.]+) rg\n([\s\S]*?)\nf\*\nQ\n/g;
const CHUNK = 250; // start a new path at the next gap between letters once a path has this many triangles
const GAP = 0.8; // user units: only start a new path where there is a real gap (between two glyphs)

const out = [];
let group = null; // { color, tris: string[], last: bbox, count }
let stats = { blocks: 0, merged: 0, degenerate: 0, untouched: 0, paths: 0 };

const flush = () => {
  if (!group || !group.tris.length) { group = null; return; }
  out.push(`q\n${group.color} rg\n${group.tris.join('')}f\nQ\n`);
  stats.paths++;
  group = null;
};

const bboxGap = (a, b) => Math.max(0, Math.max(a.x0, b.x0) - Math.min(a.x1, b.x1), Math.max(a.y0, b.y0) - Math.min(a.y1, b.y1)) ;

let lastIndex = 0, m;
while ((m = BLOCK.exec(text))) {
  stats.blocks++;
  if (m.index !== lastIndex) { flush(); out.push(text.slice(lastIndex, m.index)); }
  lastIndex = m.index + m[0].length;

  const lines = m[4].split('\n');
  const subpaths = lines.filter((l) => l.endsWith(' m')).length;
  const pts = lines.filter((l) => l.endsWith(' m') || l.endsWith(' l'));
  const hasCurve = lines.some((l) => l.endsWith(' c'));

  if (subpaths === 1 && !hasCurve && pts.length === 2) { stats.degenerate++; continue; } // zero-area sliver, invisible
  if (subpaths === 1 && !hasCurve && pts.length === 3) {
    const P = pts.map((l) => l.split(' ').slice(0, 2));
    const [x0, y0, x1, y1, x2, y2] = P.flat().map(Number);
    const area = (x1 - x0) * (y2 - y0) - (x2 - x0) * (y1 - y0);
    if (Math.abs(area) < 1e-7) { stats.degenerate++; continue; }
    const ordered = area > 0 ? P : [P[0], P[2], P[1]]; // every triangle wound the same way
    const bb = { x0: Math.min(x0, x1, x2), x1: Math.max(x0, x1, x2), y0: Math.min(y0, y1, y2), y1: Math.max(y0, y1, y2) };
    const color = `${m[1]} ${m[2]} ${m[3]}`;
    if (group && (group.color !== color || (group.count >= CHUNK && bboxGap(group.last, bb) > GAP))) flush();
    if (!group) group = { color, tris: [], last: bb, count: 0 };
    group.tris.push(`${ordered[0][0]} ${ordered[0][1]} m\n${ordered[1][0]} ${ordered[1][1]} l\n${ordered[2][0]} ${ordered[2][1]} l\nh\n`);
    group.count++;
    group.last = bb;
    stats.merged++;
  } else {
    flush();
    out.push(m[0]); // shape with holes / curves: keep exactly as it was
    stats.untouched++;
  }
}
flush();
out.push(text.slice(lastIndex));

const result = Buffer.from(out.join(''), 'latin1');
console.log(`blocks ${stats.blocks}: merged ${stats.merged} triangles into ${stats.paths} paths, dropped ${stats.degenerate} zero-area slivers, kept ${stats.untouched} complex shapes as they were`);
console.log(`new content: ${(result.length / 1048576).toFixed(1)} MB`);

// write back as ONE compressed content stream and drop the old ones
const newRef = pdf.context.register(pdf.context.flateStream(result));
page.node.set(PDFName.of('Contents'), newRef);
for (const r of refs) pdf.context.delete(r);
fs.writeFileSync(outFile, await pdf.save({ useObjectStreams: false }));
console.log(`output: ${outFile}  ${(fs.statSync(outFile).size / 1048576).toFixed(2)} MB`);
