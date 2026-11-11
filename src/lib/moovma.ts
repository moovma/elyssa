import fs from 'node:fs';
import path from 'node:path';

/* ------------------------------------------------------------------ */
/*  Brand facts                                                        */
/* ------------------------------------------------------------------ */
export const BRAND = {
  name: 'Moovma',
  slogan: 'na3mlou MoovMa sa7bi #',
  founder: 'Bejaoui Hamza',
  founderGithub: 'https://github.com/bejaouihamza',
  country: 'Tunisia',
  // Taken from the public GitHub / YouTube pages of Moovma
  githubTagline: 'Creating the largest hardware community in Tunisia',
  youtubeTagline: 'More than a startup, a movement: we believe Tunisia can create, not just consume.',
};

export const SOCIALS = [
  {
    id: 'github',
    name: 'GitHub',
    handle: 'moovma',
    url: 'https://github.com/moovma',
    blurb: 'Open-source hardware: schematics, PCB files, firmware and board packages.',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    handle: '@moovm_a',
    url: 'https://www.instagram.com/moovm_a/',
    blurb: 'Project posters, build photos and news from the lab.',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    handle: '@Moovma',
    url: 'https://www.youtube.com/@Moovma',
    blurb: 'Electronics, hardware and open knowledge, explained for makers.',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    handle: 'Moovma',
    url: 'https://www.linkedin.com/company/136294093/',
    blurb: 'Company updates, project carousels and collaborations.',
  },
] as const;

export const SERVICES = [
  {
    n: '01',
    title: 'Hardware & PCB design',
    text: 'Got an idea? We turn it into schematics, a clean multi-layer layout and a 3D-checked board that works the first time, from dev boards to mains-powered controllers.',
  },
  {
    n: '02',
    title: 'Embedded firmware',
    text: 'ESP32, STM32 and more. We write the drivers, libraries and Arduino board packages, so your board does something useful on day one.',
  },
  {
    n: '03',
    title: 'From prototype to small batch',
    text: 'We design for manufacture with partners such as NextPCB, and choose parts you can actually buy in Tunisia, so going from one board to fifty is smooth.',
  },
  {
    n: '04',
    title: 'Open knowledge & community',
    text: 'We open-source what we can and explain how it works through docs, videos and exhibitions, so more Tunisians can build, not just buy.',
  },
];

/* ------------------------------------------------------------------ */
/*  Products / projects (details read from the project posters)        */
/* ------------------------------------------------------------------ */
export interface Product {
  id: string;
  name: string;
  tagline: string;
  specs: string[];
  href?: string;
  external?: boolean;
  featured?: boolean;
}

export const PRODUCTS: Product[] = [
  {
    id: 'elyssa',
    name: 'Elyssa',
    tagline: 'The first Tunisian dev board: Wi-Fi, Bluetooth 5, motion sensing and LiPo charging on one tiny, open-source board that works with Arduino.',
    specs: ['ESP32-S3FN8', '240 MHz dual-core', 'USB-C', 'Qwiic'],
    href: '/elyssa',
    featured: true,
  },
  {
    id: 'smart-switch',
    name: 'Open-source Smart Switch',
    tagline: 'A compact smart-load controller for makers, students and engineers.',
    specs: ['Wi-Fi', 'ESP32-C3', '230 VAC'],
    href: 'https://github.com/moovma/smart-switch',
    external: true,
  },
  {
    id: 'nlim',
    name: 'NLIM power controller',
    tagline: 'Smart energy monitoring, load identification and independent control on one 12-channel PCB.',
    specs: ['5 kW', '12 loads', 'Open source'],
    href: 'https://github.com/moovma/nlim-smart-power-controller',
    external: true,
  },
  {
    id: 'relay',
    name: 'Wireless Relay Controller',
    tagline: 'Remote switching for agriculture, smart home and off-grid energy.',
    specs: ['2G GSM / GPRS', 'Wi-Fi 6 · BLE 5', 'Zigbee · Thread (ESP32-C6)'],
  },
  {
    id: 'foc',
    name: 'FOC BLDC Driver',
    tagline: 'Open-source field-oriented motor driver.',
    specs: ['Up to 50 V · 30 A', 'STM32G474', 'DRV8308'],
    href: 'https://github.com/bejaouihamza/bldc-foc-pcb',
    external: true,
  },
];

/* ------------------------------------------------------------------ */
/*  Work gallery: reads public/our_work at request/build time          */
/* ------------------------------------------------------------------ */
export interface WorkItem {
  file: string;
  src: string; // optimised copy when present
  full: string; // original
  width: number;
  height: number;
  title: string;
  tag: string;
  blurb: string;
}

const WORK_META: Record<string, { title: string; tag: string; blurb: string }> = {
  'poster exhibition.png': {
    title: 'FOC BLDC Driver',
    tag: 'Motor control',
    blurb: 'Open-source driver for brushless motors: up to 50 V and 30 A, STM32G474 with DRV8308.',
  },
  'Untitled design (1).png': {
    title: 'NLIM power controller',
    tag: 'Energy',
    blurb: '5 kW, 12-load board for smart energy monitoring, load identification and independent control.',
  },
  'Untitled (Instagram Post (45)).png': {
    title: 'Open-source Smart Switch',
    tag: 'Smart home',
    blurb: 'Compact smart-load controller on ESP32-C3 for 230 VAC, built for makers, students and engineers.',
  },
  'LAST PROJECT(LinkedIn Carousel).png': {
    title: 'Wireless Relay Controller',
    tag: 'Connectivity',
    blurb: '2G GSM/GPRS, Wi-Fi 6, Bluetooth 5, Zigbee and Thread (ESP32-C6) for agriculture, smart home and off-grid energy.',
  },
};

/** PNG/JPEG size without decoding the whole image. */
function imageSize(file: string): { width: number; height: number } | null {
  try {
    const fd = fs.openSync(file, 'r');
    const buf = Buffer.alloc(32);
    fs.readSync(fd, buf, 0, 32, 0);
    fs.closeSync(fd);
    if (buf.toString('ascii', 1, 4) === 'PNG') return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
    if (buf.toString('ascii', 8, 12) === 'WEBP') {
      if (buf.toString('ascii', 12, 16) === 'VP8X') return { width: 1 + buf.readUIntLE(24, 3), height: 1 + buf.readUIntLE(27, 3) };
    }
  } catch {
    /* ignore */
  }
  return null;
}

const IMG_RE = /\.(png|jpe?g|webp)$/i;

function listImages(folder: string): { file: string; src: string; full: string; width: number; height: number }[] {
  const dir = path.join(process.cwd(), 'public', folder);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => IMG_RE.test(f) && fs.statSync(path.join(dir, f)).isFile())
    .sort()
    .map((file) => {
      const webName = file.replace(IMG_RE, '.webp');
      const hasWeb = fs.existsSync(path.join(dir, '_web', webName));
      const dims = imageSize(path.join(dir, hasWeb ? '_web' : '', hasWeb ? webName : file)) ||
        imageSize(path.join(dir, file)) || { width: 3, height: 4 };
      return {
        file,
        src: `/${folder}/${hasWeb ? '_web/' + webName : file}`,
        full: `/${folder}/${file}`,
        width: dims.width,
        height: dims.height,
      };
    });
}

// encodeURIComponent on every segment, keeping the slashes
const enc = (p: string) => p.split('/').map((s) => encodeURIComponent(s)).join('/');

export function getWork(): WorkItem[] {
  return listImages('our_work').map((img, i) => {
    const meta = WORK_META[img.file];
    const guess = img.file.replace(IMG_RE, '').replace(/[_-]+/g, ' ');
    return {
      file: img.file,
      src: enc(img.src),
      full: enc(img.full),
      width: img.width,
      height: img.height,
      title: meta?.title ?? guess,
      tag: meta?.tag ?? 'Project',
      blurb: meta?.blurb ?? '',
    };
  });
}

export interface ProductImage {
  src: string;
  alt: string;
  kind: 'cutout' | 'front' | 'back' | 'detail' | 'other';
}

/**
 * Real Elyssa photos from public/product_images (also looks in product_images/_web).
 * Uses the optimised copy in product_images/_opt when it exists (run `npm run images`).
 * Falls back to the board renders when the folder has no images.
 */
export function getProductImages(): ProductImage[] {
  const base = path.join(process.cwd(), 'public', 'product_images');
  const seen = new Set<string>();
  const found: ProductImage[] = [];

  for (const sub of ['_web', '']) {
    const dir = path.join(base, sub);
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir).sort()) {
      const full = path.join(dir, file);
      if (!IMG_RE.test(file) || !fs.statSync(full).isFile()) continue;
      const stem = file.replace(IMG_RE, '');
      if (seen.has(stem)) continue;
      seen.add(stem);

      const optName = `${stem}.webp`;
      const hasOpt = fs.existsSync(path.join(base, '_opt', optName));
      const rel = hasOpt ? `/product_images/_opt/${optName}` : `/product_images/${sub ? sub + '/' : ''}${file}`;

      const lower = stem.toLowerCase();
      const kind: ProductImage['kind'] = lower.includes('nobackground') || lower.includes('cutout')
        ? 'cutout'
        : lower.includes('about') || lower.includes('detail')
          ? 'detail'
          : lower.includes('back')
          ? 'back'
          : lower.includes('front')
            ? 'front'
            : 'other';
      const alt =
        kind === 'cutout' ? 'Elyssa dev board, front, cut out'
        : kind === 'detail' ? 'Close-up of the Elyssa dev board: ESP32-S3, antenna and USB-C'
        : kind === 'front' ? 'Elyssa dev board, front side'
        : kind === 'back' ? 'Elyssa dev board, back side'
        : 'Elyssa dev board';
      found.push({ src: enc(rel), alt, kind });
    }
  }

  if (!found.length) {
    return [
      { src: '/elyssa_images/elyssa_top.png', alt: 'Elyssa board, top side', kind: 'front' },
      { src: '/elyssa_images/elyssa_buttom.png', alt: 'Elyssa board, back side with microSD socket', kind: 'back' },
    ];
  }
  const order = { front: 0, back: 1, detail: 2, cutout: 3, other: 4 } as const;
  return found.sort((a, b) => order[a.kind] - order[b.kind]);
}

/* ------------------------------------------------------------------ */
/*  Live GitHub data (cached one hour, falls back to static values)    */
/* ------------------------------------------------------------------ */
export interface GithubRepo {
  name: string;
  description: string;
  url: string;
  stars: number;
  language: string | null;
  updated: string;
}

export interface GithubData {
  live: boolean;
  followers: number;
  repoCount: number;
  stars: number;
  repos: GithubRepo[];
}

const FALLBACK_GITHUB: GithubData = {
  live: false,
  followers: 0,
  repoCount: 4,
  stars: 0,
  repos: [
    { name: 'Elyssa-dev-board', description: 'The first Tunisian dev board', url: 'https://github.com/moovma/Elyssa-dev-board', stars: 0, language: 'C', updated: '' },
    { name: 'smart-switch', description: 'A compact smart-load controller designed for prototyping and home automation', url: 'https://github.com/moovma/smart-switch', stars: 0, language: 'C++', updated: '' },
    { name: 'nlim-smart-power-controller', description: '12-channel smart power controller', url: 'https://github.com/moovma/nlim-smart-power-controller', stars: 0, language: null, updated: '' },
    { name: 'elyssa', description: 'This website', url: 'https://github.com/moovma/elyssa', stars: 0, language: 'TypeScript', updated: '' },
  ],
};

export async function getGithub(): Promise<GithubData> {
  try {
    const opts = { headers: { Accept: 'application/vnd.github+json' }, next: { revalidate: 3600 } } as RequestInit & {
      next: { revalidate: number };
    };
    const [orgRes, repoRes] = await Promise.all([
      fetch('https://api.github.com/orgs/moovma', opts),
      fetch('https://api.github.com/orgs/moovma/repos?per_page=30&sort=updated', opts),
    ]);
    if (!orgRes.ok || !repoRes.ok) return FALLBACK_GITHUB;
    const org = await orgRes.json();
    const repos = (await repoRes.json()) as any[];
    const mapped: GithubRepo[] = repos.map((r) => ({
      name: r.name,
      description: r.description || '',
      url: r.html_url,
      stars: r.stargazers_count ?? 0,
      language: r.language ?? null,
      updated: r.updated_at ?? '',
    }));
    return {
      live: true,
      followers: org.followers ?? 0,
      repoCount: org.public_repos ?? mapped.length,
      stars: mapped.reduce((s, r) => s + r.stars, 0),
      repos: mapped,
    };
  } catch {
    return FALLBACK_GITHUB;
  }
}
