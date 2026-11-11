// Pushes pre-orders that are in the local backup (data/preorders.json) but never reached Supabase.
//
//   node scripts/resync-preorders.mjs           -> dry run: only shows what it WOULD do
//   node scripts/resync-preorders.mjs --apply   -> inserts the missing orders and fixes wrong quantities
//
// Only orders the server flagged `supabase_saved: false` are inserted. Older backup rows (from before that
// flag existed) are listed but never inserted automatically, they may be old tests.
import fs from 'node:fs';

const apply = process.argv.includes('--apply');

const env = {};
for (const line of fs.readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) throw new Error('Supabase keys are missing in .env.local');
const headers = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };

const local = JSON.parse(fs.readFileSync('data/preorders.json', 'utf8'));
const remote = await (await fetch(`${url}/rest/v1/preorders?select=id,created_at,email,quantity`, { headers })).json();
if (!Array.isArray(remote)) throw new Error('Could not read Supabase: ' + JSON.stringify(remote));

const sameOrder = (l, r) => l.email === r.email && Math.abs(new Date(l.created_at) - new Date(r.created_at)) < 2000;

let inserted = 0, fixed = 0, skippedOld = 0;
for (const l of local) {
  const r = remote.find((x) => sameOrder(l, x));
  const qty = Math.min(10, Math.max(1, Number(l.quantity) || 1));

  if (!r) {
    if (l.supabase_saved !== false) { skippedOld++; continue; }
    const row = {
      first_name: l.first_name, family_name: l.family_name, age: l.age, email: l.email, phone: l.phone,
      is_student: l.is_student, college: l.college || '', quantity: qty,
      offered_price_dt: l.offered_price_dt ?? (parseFloat(String(l.offered_price).replace(/[^0-9.]/g, '')) || null),
      unit_price_dt: l.unit_price_dt ?? 70, status: l.status || 'pending', created_at: l.created_at,
    };
    console.log(`${apply ? 'INSERT' : 'would insert'}: ${l.created_at}  ${l.first_name} ${l.family_name}  x${qty}  desired ${row.offered_price_dt} DT`);
    if (apply) {
      const res = await fetch(`${url}/rest/v1/preorders`, { method: 'POST', headers: { ...headers, Prefer: 'return=minimal' }, body: JSON.stringify(row) });
      if (!res.ok) { console.log('   FAILED:', res.status, await res.text()); continue; }
    }
    inserted++;
  } else if (l.quantity && Number(r.quantity) !== qty) {
    console.log(`${apply ? 'UPDATE' : 'would update'} quantity: ${l.first_name} ${l.family_name} (${l.created_at})  ${r.quantity} -> ${qty}`);
    if (apply) {
      const res = await fetch(`${url}/rest/v1/preorders?id=eq.${r.id}`, { method: 'PATCH', headers: { ...headers, Prefer: 'return=minimal' }, body: JSON.stringify({ quantity: qty }) });
      if (!res.ok) { console.log('   FAILED:', res.status, await res.text()); continue; }
    }
    fixed++;
  }
}
console.log(`\n${apply ? 'Done' : 'Dry run'}: ${inserted} order(s) ${apply ? 'inserted' : 'to insert'}, ${fixed} quantity fix(es), ${skippedOld} older local rows not in Supabase were left alone.`);
if (!apply && (inserted || fixed)) console.log('Run again with --apply to do it.');
