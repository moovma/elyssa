/**
 * Builds the two owner emails from the pre-order rows:
 *  - buildNewPreorderEmail(): sent right after a pre-order, with everything needed to call the customer
 *  - buildDailyReport(): sent every evening, with the day's orders and statistics drawn as bars
 * Plain HTML with inline styles and tables, so it renders in Gmail and phone mail apps.
 * Brand colours only: black, white, greys and acid #ccff00.
 */

export interface PreorderRow {
  id?: string;
  created_at: string;
  first_name: string;
  family_name: string;
  age: number | null;
  email: string;
  phone: string;
  is_student: boolean;
  college: string | null;
  quantity: number;
  offered_price_dt: number | string | null;
  unit_price_dt?: number | string | null;
  total_price_dt?: number | string | null;
  amount_paid_dt?: number | string | null;
  payment_status?: string | null;
  status?: string | null;
}

/** Tunisia is UTC+1 all year (no daylight saving). */
const TZ_OFFSET_MIN = 60;
const UNIT_PRICE_DT = 70;
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.moovma.tn';

const num = (v: unknown) => {
  const n = typeof v === 'number' ? v : Number.parseFloat(String(v ?? ''));
  return Number.isFinite(n) ? n : 0;
};
const esc = (s: unknown) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
const dt = (v: number) => `${Math.round(v * 100) / 100} DT`;
const pct = (a: number, b: number) => (b ? `${Math.round((a / b) * 100)}%` : '0%');

/** "YYYY-MM-DD" of a date in Tunis time. */
export function tunisDay(d: Date): string {
  return new Date(d.getTime() + TZ_OFFSET_MIN * 60000).toISOString().slice(0, 10);
}
function tunisTime(iso: string): string {
  return new Date(new Date(iso).getTime() + TZ_OFFSET_MIN * 60000).toISOString().slice(11, 16);
}
function niceDay(day: string): string {
  const [y, m, d] = day.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
}
function median(values: number[]): number {
  if (!values.length) return 0;
  const s = [...values].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
const fullName = (r: PreorderRow) => `${r.first_name} ${r.family_name}`.trim();
const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '')}`;

/* ------------------------------------------------------------------ */
/*  Email building blocks                                               */
/* ------------------------------------------------------------------ */
const FONT = "font-family:Arial,Helvetica,sans-serif;";
const MONO = "font-family:'Courier New',monospace;font-size:11px;letter-spacing:.06em;text-transform:uppercase;";

function shell(title: string, intro: string, body: string): string {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f2f2f2;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f2f2f2;"><tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="640" cellpadding="0" cellspacing="0" style="max-width:640px;width:100%;background:#ffffff;${FONT}color:#000;">
<tr><td style="background:#000;padding:22px 24px;">
  <div style="${MONO}color:#ccff00;">Moovma · Elyssa pre-orders</div>
  <div style="font-family:Georgia,serif;font-size:28px;line-height:1.15;color:#fff;margin-top:8px;">${title}</div>
  <div style="font-size:14px;color:#bbbbbb;margin-top:8px;line-height:1.5;">${intro}</div>
</td></tr>
${body}
<tr><td style="padding:18px 24px 24px;border-top:1px solid #dedede;font-size:12px;color:#6b6b6b;line-height:1.6;">
  Change these emails in Supabase: Table Editor &gt; <b>email_settings</b> (notify_each_preorder, daily_report, send_to).<br>
  All orders: Supabase &gt; Table Editor &gt; <b>preorders</b>.
</td></tr>
</table></td></tr></table></body></html>`;
}

function section(label: string, inner: string): string {
  return `<tr><td style="padding:22px 24px 6px;">
  <div style="${MONO}color:#6b6b6b;border-bottom:1px solid #000;padding-bottom:8px;margin-bottom:12px;">${label}</div>
  ${inner}
</td></tr>`;
}

/** Big numbers in a row of tiles. */
function tiles(items: { label: string; value: string; accent?: boolean }[]): string {
  const cells = items
    .map(
      (t) => `<td valign="top" style="padding:12px;border:1px solid #dedede;background:${t.accent ? '#000' : '#fff'};">
  <div style="${MONO}font-size:10px;color:${t.accent ? '#ccff00' : '#6b6b6b'};">${esc(t.label)}</div>
  <div style="font-family:Georgia,serif;font-size:26px;line-height:1.1;margin-top:6px;color:${t.accent ? '#fff' : '#000'};">${esc(t.value)}</div>
</td>`
    )
    .join('');
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;"><tr>${cells}</tr></table>`;
}

/** Horizontal bar chart: label | bar | value. */
function bars(rows: { label: string; value: number; note?: string; highlight?: boolean }[], emptyText = 'No data yet.'): string {
  if (!rows.length) return `<p style="font-size:13px;color:#6b6b6b;margin:0 0 8px;">${emptyText}</p>`;
  const max = Math.max(...rows.map((r) => r.value), 1);
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">${rows
    .map((r) => {
      const w = Math.max(r.value > 0 ? 2 : 0, Math.round((r.value / max) * 100));
      return `<tr>
  <td style="font-size:13px;padding:5px 10px 5px 0;width:34%;vertical-align:middle;">${esc(r.label)}</td>
  <td style="padding:5px 0;vertical-align:middle;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:#efefef;"><tr>
      ${w > 0 ? `<td width="${w}%" style="background:${r.highlight ? '#ccff00' : '#000'};height:14px;font-size:0;line-height:0;">&nbsp;</td>` : ''}
      ${w < 100 ? `<td style="height:14px;font-size:0;line-height:0;">&nbsp;</td>` : ''}
    </tr></table>
  </td>
  <td style="font-size:13px;font-weight:bold;padding:5px 0 5px 10px;width:70px;text-align:right;vertical-align:middle;white-space:nowrap;">${esc(r.note ?? String(r.value))}</td>
</tr>`;
    })
    .join('')}</table>`;
}

function keyValues(pairs: [string, string][]): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">${pairs
    .map(
      ([k, v]) => `<tr><td style="${MONO}font-size:10px;color:#6b6b6b;padding:8px 10px 8px 0;border-bottom:1px solid #eeeeee;width:38%;vertical-align:top;">${esc(k)}</td>
<td style="font-size:14px;padding:8px 0;border-bottom:1px solid #eeeeee;vertical-align:top;">${v}</td></tr>`
    )
    .join('')}</table>`;
}

function button(href: string, label: string, acid = false): string {
  return `<a href="${esc(href)}" style="display:inline-block;padding:12px 20px;margin:4px 8px 4px 0;border-radius:9999px;${MONO}text-decoration:none;background:${acid ? '#ccff00' : '#000'};color:${acid ? '#000' : '#fff'};">${label}</a>`;
}

/* ------------------------------------------------------------------ */
/*  1. After each pre-order                                             */
/* ------------------------------------------------------------------ */
export function buildNewPreorderEmail(r: PreorderRow, todaySoFar: number) {
  const name = fullName(r);
  const total = num(r.quantity) * UNIT_PRICE_DT;
  const desired = num(r.offered_price_dt);
  const subject = `New pre-order: ${name} × ${r.quantity} (${dt(total)}) · call ${r.phone}`;
  const intro = `${esc(name)} just reserved ${r.quantity} board${r.quantity > 1 ? 's' : ''} at ${tunisTime(r.created_at)} (Tunis). That makes ${todaySoFar} pre-order${todaySoFar === 1 ? '' : 's'} today.`;
  const body =
    section(
      'Call this customer',
      `<div style="margin:2px 0 10px;">${button(telHref(r.phone), `Call ${esc(r.phone)}`, true)}${button(`mailto:${r.email}`, 'Send an email')}</div>`
    ) +
    section(
      'Order',
      keyValues([
        ['Name', `<b>${esc(name)}</b>`],
        ['Phone', `<a href="${esc(telHref(r.phone))}" style="color:#000;">${esc(r.phone)}</a>`],
        ['Email', `<a href="mailto:${esc(r.email)}" style="color:#000;">${esc(r.email)}</a>`],
        ['Age', r.age ? esc(r.age) : '—'],
        ['Student', r.is_student ? `Yes${r.college ? ` · ${esc(r.college)}` : ''}` : 'No'],
        ['Boards', esc(r.quantity)],
        ['Total to collect', `<b>${dt(total)}</b> (${r.quantity} × ${UNIT_PRICE_DT} DT)`],
        ['Desired price', desired ? `${dt(desired)} per board` : '—'],
        ['Received', `${niceDay(tunisDay(new Date(r.created_at)))}, ${tunisTime(r.created_at)} (Tunis time)`],
      ])
    ) +
    section(
      'Next steps',
      `<ol style="margin:0 0 6px 18px;padding:0;font-size:14px;line-height:1.7;">
  <li>Call ${esc(r.first_name)} to confirm the order and agree on payment.</li>
  <li>In Supabase &gt; preorders, set <b>status</b> (e.g. confirmed) and <b>amount_paid_dt</b> when paid.</li>
</ol>`
    );
  const text = [
    `New pre-order: ${name}`,
    `Phone: ${r.phone}`,
    `Email: ${r.email}`,
    `Age: ${r.age || '-'}`,
    `Student: ${r.is_student ? `yes${r.college ? `, ${r.college}` : ''}` : 'no'}`,
    `Boards: ${r.quantity} (total ${dt(total)})`,
    `Desired price: ${desired ? dt(desired) : '-'}`,
    `Pre-orders today: ${todaySoFar}`,
  ].join('\n');
  return { subject, html: shell('New pre-order', intro, body), text };
}

/* ------------------------------------------------------------------ */
/*  2. Daily report                                                     */
/* ------------------------------------------------------------------ */
const AGE_GROUPS: [string, number, number][] = [
  ['Under 16', 0, 15],
  ['16–18', 16, 18],
  ['19–22', 19, 22],
  ['23–26', 23, 26],
  ['27–35', 27, 35],
  ['36–50', 36, 50],
  ['Over 50', 51, 200],
];

export function buildDailyReport(all: PreorderRow[], now = new Date()) {
  const rows = all.filter((r) => r.payment_status !== 'refunded');
  const today = tunisDay(now);
  const todays = rows.filter((r) => tunisDay(new Date(r.created_at)) === today).sort((a, b) => a.created_at.localeCompare(b.created_at));
  const yesterday = tunisDay(new Date(now.getTime() - 86400000));
  const yesterdays = rows.filter((r) => tunisDay(new Date(r.created_at)) === yesterday);

  const sum = (list: PreorderRow[], f: (r: PreorderRow) => number) => list.reduce((s, r) => s + f(r), 0);
  const boards = (list: PreorderRow[]) => sum(list, (r) => num(r.quantity));
  const due = (list: PreorderRow[]) => sum(list, (r) => num(r.total_price_dt) || num(r.quantity) * (num(r.unit_price_dt) || UNIT_PRICE_DT));
  const paid = sum(rows, (r) => num(r.amount_paid_dt));
  const totalDue = due(rows);

  // Last 7 days
  const week = Array.from({ length: 7 }, (_, i) => tunisDay(new Date(now.getTime() - (6 - i) * 86400000)));
  const perDay = week.map((day) => {
    const list = rows.filter((r) => tunisDay(new Date(r.created_at)) === day);
    const [y, m, d] = day.split('-').map(Number);
    const label = new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });
    return { label, value: list.length, note: `${list.length} (${boards(list)} boards)`, highlight: day === today };
  });

  // Ages
  const ages = rows.map((r) => num(r.age)).filter((a) => a > 0);
  const ageBars: { label: string; value: number; note: string; highlight?: boolean }[] = AGE_GROUPS.map(([label, lo, hi]) => {
    const n = ages.filter((a) => a >= lo && a <= hi).length;
    return { label, value: n, note: `${n} · ${pct(n, ages.length)}` };
  }).filter((b) => b.value > 0);
  const topAge = ageBars.reduce((best, b) => (b.value > (best?.value ?? 0) ? b : best), ageBars[0]);
  ageBars.forEach((b) => (b.highlight = b === topAge));

  // Students and colleges
  const students = rows.filter((r) => r.is_student);
  const collegeCount = new Map<string, number>();
  students.forEach((r) => {
    const c = (r.college || '').trim();
    const key = c ? c.replace(/\s+/g, ' ') : 'Not given';
    const found = [...collegeCount.keys()].find((k) => k.toLowerCase() === key.toLowerCase()) ?? key;
    collegeCount.set(found, (collegeCount.get(found) ?? 0) + 1);
  });
  const collegeBars = [...collegeCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([label, value], i) => ({ label: `${i + 1}. ${label}`, value, note: `${value} · ${pct(value, students.length)}`, highlight: i === 0 }));

  // Desired prices
  const prices = rows.map((r) => num(r.offered_price_dt)).filter((p) => p > 0);
  const priceCount = new Map<number, number>();
  prices.forEach((p) => priceCount.set(p, (priceCount.get(p) ?? 0) + 1));
  const priceBars = [...priceCount.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([p, n]) => ({ label: `${p} DT`, value: n, note: `${n} · ${pct(n, prices.length)}`, highlight: p === UNIT_PRICE_DT }));
  const atOrAbove = prices.filter((p) => p >= UNIT_PRICE_DT).length;

  // Quantity, payment and workflow status
  const qtyCount = new Map<number, number>();
  rows.forEach((r) => qtyCount.set(num(r.quantity), (qtyCount.get(num(r.quantity)) ?? 0) + 1));
  const qtyBars = [...qtyCount.entries()].sort((a, b) => a[0] - b[0]).map(([q, n]) => ({ label: `${q} board${q > 1 ? 's' : ''}`, value: n, note: `${n} orders` }));
  const count = (list: PreorderRow[], key: 'payment_status' | 'status') => {
    const m = new Map<string, number>();
    list.forEach((r) => m.set(String(r[key] || 'unknown'), (m.get(String(r[key] || 'unknown')) ?? 0) + 1));
    return [...m.entries()].sort((a, b) => b[1] - a[1]).map(([label, value]) => ({ label, value, note: `${value} · ${pct(value, list.length)}` }));
  };

  /* ---- Email ---- */
  const diff = todays.length - yesterdays.length;
  const trend = diff === 0 ? 'same as yesterday' : `${diff > 0 ? '+' : ''}${diff} vs yesterday`;
  const subject = `Elyssa daily report · ${today}: ${todays.length} new pre-order${todays.length === 1 ? '' : 's'} (${rows.length} total)`;
  const intro = `${niceDay(today)} (Tunis time). ${todays.length} new pre-order${todays.length === 1 ? '' : 's'} today, ${trend}.`;

  const todayList = todays.length
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:13px;">
<tr>${['Time', 'Name', 'Phone', 'Boards', 'Wants', 'Student'].map((h) => `<td style="${MONO}font-size:10px;color:#6b6b6b;padding:6px 6px 6px 0;border-bottom:1px solid #000;">${h}</td>`).join('')}</tr>
${todays
  .map(
    (r) => `<tr>
<td style="padding:8px 6px 8px 0;border-bottom:1px solid #eeeeee;white-space:nowrap;">${tunisTime(r.created_at)}</td>
<td style="padding:8px 6px 8px 0;border-bottom:1px solid #eeeeee;"><b>${esc(fullName(r))}</b><br><span style="color:#6b6b6b;">${esc(r.email)}${r.age ? ` · ${esc(r.age)} y` : ''}</span></td>
<td style="padding:8px 6px 8px 0;border-bottom:1px solid #eeeeee;white-space:nowrap;"><a href="${esc(telHref(r.phone))}" style="color:#000;">${esc(r.phone)}</a></td>
<td style="padding:8px 6px 8px 0;border-bottom:1px solid #eeeeee;">${esc(r.quantity)}</td>
<td style="padding:8px 6px 8px 0;border-bottom:1px solid #eeeeee;white-space:nowrap;">${num(r.offered_price_dt) ? dt(num(r.offered_price_dt)) : '—'}</td>
<td style="padding:8px 0;border-bottom:1px solid #eeeeee;">${r.is_student ? esc(r.college || 'Yes') : 'No'}</td>
</tr>`
  )
  .join('')}</table>`
    : `<p style="font-size:14px;margin:0 0 8px;">No new pre-orders today.</p>`;

  const body =
    section(
      'Today',
      tiles([
        { label: 'New pre-orders', value: String(todays.length), accent: true },
        { label: 'Boards', value: String(boards(todays)) },
        { label: 'Value', value: dt(due(todays)) },
        { label: 'Students', value: String(todays.filter((r) => r.is_student).length) },
      ]) + `<div style="height:14px;"></div>` + todayList
    ) +
    section(
      'All time',
      tiles([
        { label: 'Pre-orders', value: String(rows.length) },
        { label: 'Boards', value: String(boards(rows)) },
        { label: 'To collect', value: dt(totalDue) },
      ]) +
        `<div style="height:8px;"></div>` +
        tiles([
          { label: 'Paid', value: dt(paid) },
          { label: 'Still due', value: dt(Math.max(0, totalDue - paid)) },
          { label: 'Paid %', value: pct(paid, totalDue) },
        ])
    ) +
    section('Last 7 days (pre-orders per day)', bars(perDay)) +
    section(
      `Ages${ages.length ? ` · average ${Math.round((ages.reduce((a, b) => a + b, 0) / ages.length) * 10) / 10} · median ${median(ages)} · youngest ${Math.min(...ages)} · oldest ${Math.max(...ages)}` : ''}`,
      bars(ageBars.sort((a, b) => b.value - a.value), 'No ages yet.')
    ) +
    section(
      `Colleges ranking · ${students.length} student${students.length === 1 ? '' : 's'} (${pct(students.length, rows.length)} of orders)`,
      bars(collegeBars, 'No students yet.')
    ) +
    section(
      `Prices customers suggested${prices.length ? ` · average ${dt(prices.reduce((a, b) => a + b, 0) / prices.length)} · median ${dt(median(prices))} · ${pct(atOrAbove, prices.length)} at or above ${UNIT_PRICE_DT} DT` : ''}`,
      bars(priceBars, 'No suggested prices yet.')
    ) +
    section('Boards per order', bars(qtyBars)) +
    section('Payment status', bars(count(rows, 'payment_status'))) +
    section('Order status', bars(count(rows, 'status'))) +
    section('Links', `<div>${button(`${SITE}/elyssa`, 'Open the site', true)}</div>`);

  const text = [
    `Elyssa daily report, ${today} (Tunis time)`,
    `Today: ${todays.length} pre-orders, ${boards(todays)} boards, ${dt(due(todays))} (${trend})`,
    `All time: ${rows.length} pre-orders, ${boards(rows)} boards, ${dt(totalDue)} to collect, ${dt(paid)} paid`,
    ages.length ? `Average age: ${Math.round((ages.reduce((a, b) => a + b, 0) / ages.length) * 10) / 10}` : '',
    prices.length ? `Average suggested price: ${dt(prices.reduce((a, b) => a + b, 0) / prices.length)}` : '',
    ...todays.map((r) => `- ${tunisTime(r.created_at)} ${fullName(r)} ${r.phone} x${r.quantity}`),
  ]
    .filter(Boolean)
    .join('\n');

  return { subject, html: shell('Daily pre-order report', intro, body), text, todayCount: todays.length };
}
