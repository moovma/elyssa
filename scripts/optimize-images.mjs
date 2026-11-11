// Creates web-sized WebP copies of the big images used by the Moovma and shop pages.
//   public/our_work/*.png                      -> public/our_work/_web/<name>.webp        (1100 px wide)
//   public/product_images/{,_web/}*.{jpg,png}  -> public/product_images/_opt/<name>.webp  (1400 px wide, keeps transparency)
// Run:  npm run images
// The pages automatically use the optimised copy when it exists and fall back to the original otherwise.
import { readdirSync, mkdirSync, existsSync, statSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve('public');
const exts = new Set(['.png', '.jpg', '.jpeg', '.webp']);

const jobs = [
  { sources: ['our_work'], out: 'our_work/_web', width: 1100 },
  { sources: ['product_images/_web', 'product_images'], out: 'product_images/_opt', width: 1400 },
];

for (const job of jobs) {
  const outDir = path.join(root, job.out);
  for (const rel of job.sources) {
    const dir = path.join(root, rel);
    if (!existsSync(dir)) continue;
    for (const file of readdirSync(dir)) {
      const ext = path.extname(file).toLowerCase();
      const src = path.join(dir, file);
      if (!exts.has(ext) || !statSync(src).isFile()) continue;
      mkdirSync(outDir, { recursive: true });
      const dest = path.join(outDir, path.basename(file, ext) + '.webp');
      if (existsSync(dest) && statSync(dest).mtimeMs > statSync(src).mtimeMs) continue; // up to date
      const info = await sharp(src, { limitInputPixels: false })
        .resize({ width: job.width, withoutEnlargement: true })
        .webp({ quality: 84 })
        .toFile(dest);
      console.log(`${rel}/${file} -> ${job.out}/${path.basename(dest)}  ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)} KB`);
    }
  }
}
