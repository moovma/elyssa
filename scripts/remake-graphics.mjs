// Re-draws the Moovma decorative shapes as perfectly clean vector SVGs (a few hundred bytes each).
// The originals in public/graphics ("graphic element*.svg") contain embedded raster images, which is why
// they looked soft; these are built from exact geometry (arcs and straight lines), so they stay razor sharp
// at any size and can be recoloured freely (the site uses them as CSS masks).
//
//   output: public/graphics/shapes/<name>.svg
// Run:  npm run graphics
import { mkdirSync, writeFileSync, copyFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const dir = path.resolve('public/graphics');
const out = path.join(dir, 'shapes');
mkdirSync(out, { recursive: true });

const svg = (w, h, d, extra = '') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid meet"><path ${extra}d="${d}"/></svg>\n`;

/** polygon with softly rounded corners (radius r) */
function roundedPolygon(points, r) {
  const n = points.length;
  let d = '';
  for (let i = 0; i < n; i++) {
    const p0 = points[(i + n - 1) % n], p1 = points[i], p2 = points[(i + 1) % n];
    const v1 = [p0[0] - p1[0], p0[1] - p1[1]], v2 = [p2[0] - p1[0], p2[1] - p1[1]];
    const l1 = Math.hypot(...v1), l2 = Math.hypot(...v2);
    const a = [p1[0] + (v1[0] / l1) * r, p1[1] + (v1[1] / l1) * r];
    const b = [p1[0] + (v2[0] / l2) * r, p1[1] + (v2[1] / l2) * r];
    d += `${i === 0 ? 'M' : 'L'}${a[0].toFixed(2)} ${a[1].toFixed(2)}Q${p1[0]} ${p1[1]} ${b[0].toFixed(2)} ${b[1].toFixed(2)}`;
  }
  return d + 'Z';
}

const R = 25 * Math.SQRT2; // pinwheel petal radius = 35.355
const shapes = {
  // four semicircles around a square hole
  clover: svg(
    320, 320,
    'M80 80A80 80 0 0 1 240 80A80 80 0 0 1 240 240A80 80 0 0 1 80 240A80 80 0 0 1 80 80Z M110 110H210V210H110Z',
    'fill-rule="evenodd" '
  ),
  // four 90 degree sectors, rotated around the centre
  pinwheel: svg(
    100, 100,
    `M25 0L50 25A${R.toFixed(3)} ${R.toFixed(3)} 0 0 1 100 25L75 50A${R.toFixed(3)} ${R.toFixed(3)} 0 0 1 75 100L50 75A${R.toFixed(3)} ${R.toFixed(3)} 0 0 1 0 75L25 50A${R.toFixed(3)} ${R.toFixed(3)} 0 0 1 25 0Z`
  ),
  // two stacked blocks: rounded right end on top, rounded left end below
  blocks: svg(224, 200, 'M0 0H174A50 50 0 0 1 174 100H224V200H50A50 50 0 0 1 50 100H0Z'),
  // hexagon with two diagonal cuts, 180 degree symmetric, softly rounded corners
  gem: svg(600, 561, roundedPolygon([[270, 0], [600, 0], [600, 314], [330, 561], [0, 561], [0, 247]], 7)),
};

for (const [name, markup] of Object.entries(shapes)) {
  writeFileSync(path.join(out, `${name}.svg`), markup);
  console.log(`${name}.svg  ${markup.length} bytes`);
}

// the crenellated bar was already a clean vector: copy it as is
const waveSrc = path.join(dir, 'graphic element1.svg');
if (existsSync(waveSrc)) {
  copyFileSync(waveSrc, path.join(out, 'wave.svg'));
  console.log('wave.svg  copied (original vector)');
}
