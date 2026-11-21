import { NextResponse } from 'next/server';
import { createServerClient, isSupabaseConfigured } from '@/lib/supabase';
import { getEmailSettings, sendEmail } from '@/lib/email';
import { buildDailyReport, tunisDay, type PreorderRow } from '@/lib/preorder-report';

/**
 * Daily pre-order report e-mail. Called by Vercel Cron every day (see vercel.json: 19:00 UTC = 20:00 Tunis).
 * Protected by CRON_SECRET: Vercel sends "Authorization: Bearer <CRON_SECRET>" automatically.
 *
 * Manual use (same header, or ?key=<CRON_SECRET>):
 *   /api/cron/daily-report?preview=1   -> shows the e-mail in the browser, sends nothing
 *   /api/cron/daily-report?force=1     -> sends again even if today's report was already sent
 * Switch it off in Supabase: email_settings.daily_report = false.
 */
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const secret = process.env.CRON_SECRET;
  const given = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') || url.searchParams.get('key');
  if (!secret || given !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!isSupabaseConfigured) {
    return NextResponse.json({ error: 'Supabase is not configured' }, { status: 500 });
  }

  const supabase = createServerClient();
  const preview = url.searchParams.has('preview');
  const force = url.searchParams.has('force');
  const settings = await getEmailSettings(supabase);

  if (!preview && !settings.daily_report) {
    return NextResponse.json({ skipped: 'daily_report is off in email_settings' });
  }
  const today = tunisDay(new Date());
  if (!preview && !force && settings.last_daily_sent_at && tunisDay(new Date(settings.last_daily_sent_at)) === today) {
    return NextResponse.json({ skipped: 'already sent today' });
  }

  const { data, error } = await supabase.from('preorders').select('*').order('created_at', { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const report = buildDailyReport((data ?? []) as PreorderRow[]);
  if (preview) {
    return new NextResponse(report.html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }

  const res = await sendEmail({ to: settings.send_to, subject: report.subject, html: report.html, text: report.text });
  if (!res.sent) return NextResponse.json({ error: res.error }, { status: 502 });

  await supabase.from('email_settings').update({ last_daily_sent_at: new Date().toISOString() }).eq('id', 1);
  return NextResponse.json({ sent: true, to: settings.send_to, today: report.todayCount });
}
