/*
 * Layout audit for the Moovma website (paste into the browser console on any page of the running site).
 *
 * For each page and screen width it loads the page in a hidden iframe and reports:
 *   - hscroll   : true if the page scrolls sideways (bad)
 *   - overflow  : elements sticking out of the screen (bad)
 *   - shapes    : decorative <Gfx> shapes visible at that width
 *   - OVERLAP   : a shape touching text, an image, a button, a card or another shape (bad; 12 px margin,
 *                 spinning shapes are checked with their worst-case rotated size)
 *
 * Usage (dev server running, open http://localhost:3000, then in the console):
 *   await auditPages(['/', '/elyssa', '/shop', '/docs', '/preorder'], [320, 375, 768, 1024, 1366, 1920])
 * Keep each call short (2–3 pages) if your tool has a timeout.
 */
window.auditPages = async (paths, widths) => {
  const out = [];
  for (const path of paths) for (const w of widths) out.push(await auditOne(path, w));
  console.table(out);
  return out;
};

async function auditOne(path, w) {
  const f = document.createElement('iframe');
  f.style.cssText = `position:fixed;left:-9999px;top:0;width:${w}px;height:900px;border:0`;
  f.src = path;
  document.body.appendChild(f);
  await new Promise((res) => { f.onload = res; setTimeout(res, 8000); });
  await new Promise((r) => setTimeout(r, 1800)); // let lazy parts and fonts settle
  const d = f.contentDocument, win = f.contentWindow;
  const vw = d.documentElement.clientWidth, sx = win.scrollX, sy = win.scrollY, MARGIN = 12;
  const inGfx = (n) => !!(n.closest && n.closest('[data-gfx]')) || !!(n.parentElement && n.parentElement.closest('[data-gfx]'));
  const gfxs = [...d.querySelectorAll('[data-gfx]')].filter((g) => win.getComputedStyle(g).display !== 'none');

  // content boxes: every text line + media/controls + any element with a background or a border
  const boxes = [];
  const add = (r, label) => { if (r.width > 1 && r.height > 1) boxes.push({ l: r.left + sx, t: r.top + sy, r: r.right + sx, b: r.bottom + sy, label }); };
  const tw = d.createTreeWalker(d.body, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = tw.nextNode())) {
    if (!n.textContent.trim() || inGfx(n)) continue;
    const pe = n.parentElement, cs = win.getComputedStyle(pe);
    if (cs.display === 'none' || cs.visibility === 'hidden' || pe.closest('script,style,noscript')) continue;
    const range = d.createRange(); range.selectNodeContents(n);
    [...range.getClientRects()].forEach((r) => add(r, 'text: ' + n.textContent.trim().slice(0, 28)));
  }
  const overflow = new Set();
  d.querySelectorAll('body *').forEach((el) => {
    if (inGfx(el)) return;
    const cs = win.getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') return;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return;
    // sideways overflow (ignored inside scroll/clip containers)
    if (cs.position !== 'fixed' && (r.right > vw + 1 || r.left < -1)) {
      let q = el.parentElement, clipped = false;
      while (q && q !== d.body) { if (/(auto|scroll|hidden|clip)/.test(win.getComputedStyle(q).overflowX)) { clipped = true; break; } q = q.parentElement; }
      if (!clipped) overflow.add(el.tagName + '.' + String(el.className || '').split(' ')[0]);
    }
    if (/^(SCRIPT|STYLE|HTML|BODY|MAIN|SECTION|HEADER|FOOTER)$/.test(el.tagName)) return;
    if (gfxs.some((g) => el.contains(g))) return; // a shape's own host
    const media = /^(IMG|CANVAS|VIDEO|INPUT|SELECT|TEXTAREA|BUTTON|SVG|svg)$/.test(el.tagName);
    const bg = cs.backgroundColor, hasBg = bg && !/rgba\(0, 0, 0, 0\)|transparent/.test(bg);
    const hasBorder = ['Top', 'Right', 'Bottom', 'Left'].some((s) => parseFloat(cs['border' + s + 'Width']) > 0 && cs['border' + s + 'Style'] !== 'none');
    if (media || hasBg || hasBorder) add(r, el.tagName.toLowerCase() + '.' + String(el.className || '').split(' ')[0]);
  });

  const shapes = gfxs.map((g) => {
    const r = g.getBoundingClientRect(), spin = !!g.querySelector('.gfx-spin-slow');
    let l = r.left + sx, t = r.top + sy, rr = r.right + sx, b = r.bottom + sy;
    if (spin) { const cx = (l + rr) / 2, cy = (t + b) / 2, h = Math.max(r.width, r.height) * 0.7072; l = cx - h; rr = cx + h; t = cy - h; b = cy + h; }
    return { l: l - MARGIN, t: t - MARGIN, r: rr + MARGIN, b: b + MARGIN, name: [...g.classList].find((c) => /^gfx-(clover|wave|blocks|gem|pinwheel)$/.test(c)) };
  });
  const hit = (a, c) => a.l < c.r && a.r > c.l && a.t < c.b && a.b > c.t;
  const problems = new Set();
  shapes.forEach((s, i) => {
    boxes.forEach((c) => { if (hit(s, c)) problems.add(s.name + ' x ' + c.label); });
    shapes.forEach((o, j) => { if (j > i && hit(s, o)) problems.add(s.name + ' x ' + o.name); });
  });
  const result = {
    page: path, width: w,
    hscroll: d.documentElement.scrollWidth > vw + 1,
    overflow: overflow.size ? [...overflow].slice(0, 4).join(', ') : 'none',
    shapes: gfxs.length,
    overlaps: problems.size ? [...problems].slice(0, 5).join(' | ') : 'none',
  };
  f.remove();
  return result;
}
