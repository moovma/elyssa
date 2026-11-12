# Moovma website — guide for AI assistants and developers

Read this file completely before changing anything. It is the single source of truth for how this project
works and for the decisions the owner has already made. **Do not re-litigate decisions listed here.**

- Owner / founder: **Bejaoui Hamza** (Moovma). Contact e-mail used on the site: `moovmabh@gmail.com`.
- Stack: **Next.js 14 (App Router) + TypeScript + plain CSS** (`src/app/globals.css`), deployed on **Vercel**.
- Database: **Supabase** (table `preorders`). Analytics: **Vercel Web Analytics + Speed Insights**.
- Live URL today: `https://moovma-git-main-moovma.vercel.app` (see "Domain" below).
- Sister project: the **Moovma Athir** mobile app lives in a separate folder (`../moovma-athir`). It reuses this
  site's design identity. Do not put app code in this repo.

---

## 1. Commands

```bash
npm install            # once
npm run dev            # http://localhost:3000
npm run build          # production build (must pass before every push)
npm run images         # make web-sized copies of photos/posters (see §7)
npm run graphics       # rebuild the vector decorative shapes (see §8)
npm run schematic      # repair + brand the schematic PDF after a new KiCad export (see §9)
node scripts/resync-preorders.mjs          # dry run: orders in the local backup missing from Supabase
node scripts/resync-preorders.mjs --apply  # push them
```

Stop `npm run dev` before `npm run build` (they share the `.next` folder).
Deploy = push to `main` on GitHub; Vercel builds automatically.

## 2. Pages (routes)

| Route | File | What it is |
|---|---|---|
| `/` | `src/app/page.tsx` | **Moovma home** (the main page): hero, "where to start" cards, about (founder, slogan, live GitHub stats), services, products, poster gallery ("our work"), community/socials, contact form |
| `/elyssa` | `src/app/elyssa/page.tsx` | **Elyssa overview**: hero, interactive 3D board, features + build ideas, specs, quick start, docs teaser, pre-order banner + FAQ |
| `/shop` | `src/app/shop/page.tsx` | Elyssa product page: photo gallery, benefits, how pre-ordering works, links to Overview / Pre-order / Docs. **No price shown here** (owner decision) |
| `/preorder` | `src/app/preorder/page.tsx` | Pre-order form (quantity 1–10, desired price pills, student switch) → black "wipe" transition → inverted confirmation that reveals the price (70 DT) |
| `/docs` | `src/app/docs/page.tsx` | Technical docs: downloads, pinout, pin safety table, "what each pin can do", power rules + table, disclaimer, contact |
| `/api/preorder` | `src/app/api/preorder/route.ts` | Saves a pre-order to Supabase (+ local JSON backup) |
| `/sitemap.xml`, `/robots.txt` | `src/app/sitemap.ts`, `robots.ts` | SEO, built from `SITE_URL` |

## 3. Folder map

```
src/app/            routes (see table) + globals.css (ALL styles live here) + layout.tsx (fonts, metadata, analytics)
src/components/     UI pieces (Navbar has two variants: 'moovma' for /, /shop and 'elyssa' for the Elyssa pages)
src/lib/moovma.ts       Moovma content: brand facts, socials, services, products, poster captions, image loaders, live GitHub fetch
src/lib/elyssa-docs.ts  Elyssa technical data: header pins, pin safety, pin capabilities, power rules/rows, disclaimer
src/lib/site.ts         public site URL (env NEXT_PUBLIC_SITE_URL)
src/lib/supabase.ts     Supabase clients;  src/lib/preorder-insert.ts  adaptive insert (see §6)
src/lib/track.ts        analytics helper; src/components/AnalyticsEvents.tsx global click tracking
public/elyssa_3d/       elyssa-compressed.glb (the ONLY model the site loads) + elyssa.glb (source, not served to users)
public/draco/           local Draco decoder for the GLB
public/elyssa_images/   board renders + elyssa_schematic.pdf (repaired + branded, see §9)
public/product_images/  real Elyssa photos: originals in _web/, served copies in _opt/ (generated)
public/our_work/        project posters: originals + _web/ (generated)
public/graphics/        logo2.svg (hero logo), original "graphic element*.svg", shapes/ (clean vectors used by the site)
public/PNG/             Moovma logos (black, white) + favicon ICON
scripts/                maintenance scripts (images, graphics, schematic, resync, QA audit)
supabase_schema.sql     full database script (idempotent, see §6)
data/preorders.json     LOCAL backup of orders (git-ignored, contains personal data: never commit or publish)
```

## 4. Content rules (owner decisions — follow strictly)

1. **Elyssa is "the first Tunisian dev board".** Never write "made in Tunisia" (it is designed in Tunisia,
   not manufactured there). "Designed in Tunisia" and "Proudly Tunisian" are fine.
2. Slogan: **"na3mlou MoovMa sa7bi #"**. Founder: **Bejaoui Hamza**. Mission line: "We create the future of Tunisia".
3. Tone: energetic, confident, helpful, short sentences, no jargon without explanation. Benefits before specs.
4. **Never invent facts.** No delivery dates, stock numbers, prices (other than 70 DT on the confirmation page),
   test results, certifications or testimonials. Hardware facts must come from the schematic, the repo
   (`github.com/moovma/Elyssa-dev-board`) or `src/lib/elyssa-docs.ts`.
5. The docs page has **no "Source" column** and ends with the **disclaimer** (Moovma is not responsible for damage
   from use/misuse). Do not add "not tested" lists back.
6. No phone number on the site. Contact = e-mail form (`mailto:`), no backend.
7. The shop must not show the price; the price is revealed after pre-ordering.

## 5. Design system (also the identity of the mobile app)

- Colours: black `#000`, white `#fff`, acid green `#ccff00` (accent, used sparingly: main buttons, highlights),
  muted text `#6b6b6b`, lines `#dedede`. Dark surfaces: `#0d0d0d`, borders on black `#333`.
  Decorative extras are **grayscale only** (black → white). No other colours.
- Fonts: **DM Serif Display** (headings, tight letter-spacing −0.04em, italic `<em>` for emphasis),
  **Manrope** (body), **DM Mono** (10–11 px UPPERCASE labels, letter-spacing .07em).
- Layout: full-width bands alternating **white / black**; content width 1180 px; square cards with 1 px lines;
  **pill buttons** (radius 9999px); section labels like `01  WHAT IS MOOVMA`.
- Motion: subtle (fade/slide-in on scroll, slow spin), always respects `prefers-reduced-motion`.
- Must work from 320 px phones to 2560 px screens, no sideways scroll, tap targets ≥ 32–44 px, inputs ≥ 16 px on mobile.

## 6. Pre-orders + Supabase

- Table `public.preorders` (see `supabase_schema.sql`, safe to re-run). Column order: customer → order → money → `status`, `notes` (last).
  Money columns: `offered_price_dt` (desired price), `unit_price_dt` (70), `total_price_dt`, `amount_paid_dt`
  (owner edits this), `balance_due_dt`, `paid_percent`, `payment_status` (auto via trigger), `payment_method`, `paid_at`.
  View `preorders_summary` gives totals. RLS: anon may insert only unpaid/pending rows.
- The API uses the **service role key** server-side and `insertAdaptive()`: if the table lacks a column the value
  goes into `notes` instead of failing. Response field `supabaseSaved` tells if the DB write worked.
- `data/preorders.json` is a local backup only; on Vercel it cannot persist (read-only disk). Supabase is the truth.
- If orders are missing in Supabase: `node scripts/resync-preorders.mjs` (dry run) then `--apply`.

## 7. Images

Put new photos in `public/product_images/` (or its `_web/`), posters in `public/our_work/`, then `npm run images`.
Pages pick up new files automatically (`getProductImages()`, `getWork()` in `src/lib/moovma.ts`).
Naming in product_images: `front…`, `back…`, `…nobackground` (cut-out), `…about…`/`detail` (close-up).
Poster captions are in `WORK_META` (`src/lib/moovma.ts`), keyed by file name.

## 8. Decorative shapes (graphics)

- Clean vector shapes in `public/graphics/shapes/` (clover, wave, blocks, gem, pinwheel), built by
  `scripts/remake-graphics.mjs`. Used through `<Gfx>` (`src/components/Gfx.tsx`) as CSS masks.
- Owner rules: **few** shapes (≈8 on the whole site), **grayscale** (the only exception: the acid pinwheel in the
  home hero), only on screens ≥ 1000 px, **never overlapping anything**. After moving a shape, run the layout audit
  (`scripts/qa-layout-audit.js`, instructions inside).

## 9. 3D model and schematic

- `ThreeViewer.tsx`: loads `elyssa-compressed.glb` (Draco, decoder in `/public/draco`). PCB colour is tinted in a
  shader to the real solder-mask green `#00763A`. Part highlight boxes = `PART_BOXES` (pixel boxes measured on
  `elyssa_images/elyssa_top.png` / `elyssa_buttom.png`). Camera starts slightly from below. `CONFIG.zoomOut`
  sets model size. On phones the canvas sits between the status line and the hint/legend (no overlap).
- Schematic PDF: KiCad export → copy to `public/elyssa_images/elyssa_schematic.pdf` → `npm run schematic`.
  This (1) merges the hundreds of thousands of tiny text triangles that caused white seams, (2) adds the Moovma
  logo + "Designed & revised by Bejaoui Hamza" in the title block. Safe to run twice.

## 10. Analytics, SEO, domain

- `<Analytics/>` and `<SpeedInsights/>` in `layout.tsx` (enable both in the Vercel dashboard). Custom events:
  `preorder_submitted`, `contact_form_submit`, `click_preorder`, `click_shop`, `click_docs`, `click_elyssa_overview`,
  `download`, `click_email`, `click_social`, `click_external`. Never send personal data.
- Domain: `moovma.vercel.app` was **not attached** and `www.moovma.tn` did not resolve (Nov 2026). When a domain
  works, set `NEXT_PUBLIC_SITE_URL` in Vercel and redeploy. Submit `/sitemap.xml` in Google Search Console.

## 11. Environment variables (`.env.local`, and the same in Vercel)

See `.env.example`. Never commit `.env.local`. Never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser.

## 12. QA checklist before you push

1. `npm run build` passes.
2. Pages look right at 320, 375, 768, 1024, 1280, 1920 px; no sideways scroll; mobile menu opens as a dropdown.
3. Layout/overlap audit passes (`scripts/qa-layout-audit.js`).
4. Pre-order test: use a marked fake order, check Supabase, then delete that row and restore `data/preorders.json`.
5. Copy follows §4.

## 13. Ideas / TODO (not done yet)

- Attach a working domain (`moovma.vercel.app` or `moovma.tn`) and set `NEXT_PUBLIC_SITE_URL`.
- Add a "Moovma Athir app — coming soon" section on `/` and `/elyssa` once the app has a store link.
- Optional: real e-mail sending for the contact form (today it opens the visitor's mail app).
- Optional: an admin view of pre-orders (today: Supabase dashboard).
