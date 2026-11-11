// Adds the Moovma logo and the credit line to the schematic's title block (the big empty box at the bottom right).
//
//   node scripts/add-title-block.mjs <input.pdf> [output.pdf]
//   npm run schematic        (repairs the white gaps, then adds the title block, on public/elyssa_images/elyssa_schematic.pdf)
//
// Safe to run twice: it leaves a marker in the PDF keywords and skips files that already have the title block.
import fs from 'node:fs';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const [inFile, outFile = inFile] = process.argv.slice(2);
if (!inFile) throw new Error('usage: node scripts/add-title-block.mjs <input.pdf> [output.pdf]');

const MARKER = 'moovma-title-block';
const LOGO = 'public/PNG/Moovma Black@2x.png';
const CREDIT = { by: 'Designed & revised by', name: 'Bejaoui Hamza' };

const pdf = await PDFDocument.load(fs.readFileSync(inFile), { updateMetadata: false });
if ((pdf.getKeywords() || '').includes(MARKER)) {
  console.log('title block already present, nothing to do');
  process.exit(0);
}
const page = pdf.getPage(0);
const { height: pageH } = page.getSize();

// The empty box of the KiCad title block. KiCad draws in 1/96 inch units (x0.75 = PDF points), y counted from the top.
const U = 0.75;
const box = {
  x: 1791.4 * U,
  w: (2199.7 - 1791.4) * U,
  yTop: 1421.0 * U,
  yBottom: 1479.7 * U,
};
const pdfBottom = pageH - box.yBottom; // PDF y axis starts at the bottom
const boxH = box.yBottom - box.yTop;

const logo = await pdf.embedPng(fs.readFileSync(LOGO));
const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
const regular = await pdf.embedFont(StandardFonts.Helvetica);
const ink = rgb(0.5176, 0, 0); // the dark red KiCad uses for the title block
const gray = rgb(0.38, 0.38, 0.38);

const pad = 5;
const logoH = boxH - pad * 2;
const logoW = (logo.width / logo.height) * logoH;
page.drawImage(logo, { x: box.x + pad + 2, y: pdfBottom + pad, width: logoW, height: logoH });

const tx = box.x + pad + 2 + logoW + 10;
const top = pdfBottom + boxH;
page.drawText('Elyssa · ESP32-S3 development board', { x: tx, y: top - 14, size: 10.5, font: bold, color: ink });
page.drawText(CREDIT.by, { x: tx, y: top - 25.5, size: 7, font: regular, color: gray });
page.drawText(CREDIT.name, { x: tx + regular.widthOfTextAtSize(CREDIT.by + ' ', 7), y: top - 25.5, size: 8.5, font: bold, color: ink });
page.drawText('Moovma · open-source hardware from Tunisia · github.com/moovma', { x: tx, y: top - 36.5, size: 6.2, font: regular, color: gray });

pdf.setTitle('Elyssa schematic');
pdf.setAuthor(CREDIT.name);
pdf.setCreator('Moovma');
pdf.setKeywords([MARKER]);
fs.writeFileSync(outFile, await pdf.save({ useObjectStreams: false }));
console.log(`title block added -> ${outFile} (${(fs.statSync(outFile).size / 1048576).toFixed(2)} MB)`);
