import { NextResponse } from 'next/server';
import { createServerClient, isSupabaseConfigured } from '@/lib/supabase';
import { getEmailSettings, isEmailConfigured, sendEmail } from '@/lib/email';

/**
 * Contact form -> e-mail to the owner through Resend (same address as the pre-order emails:
 * email_settings.send_to in Supabase, default moovmabh@gmail.com). Reply-To is the visitor,
 * so the owner just presses Reply. Nothing is stored.
 *
 * Anti-spam: a hidden "website" field (people never see it, bots fill it) and a minimum time
 * between showing the form and sending it. Bots get a fake "sent" so they do not retry.
 */
const TOPICS = ['Hardware question', 'Pre-order question', 'Software / Arduino question', 'Something else'];
const MIN_FILL_MS = 2500;

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
const clean = (v: unknown, max: number) => String(v ?? '').replace(/\s+$/g, '').trim().slice(0, max);
const isEmail = (s: string) => /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]{2,}$/.test(s);

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  // Bots: pretend it worked
  const startedAt = Number(body.startedAt) || 0;
  if (clean(body.website, 200) || (startedAt && Date.now() - startedAt < MIN_FILL_MS)) {
    return NextResponse.json({ sent: true });
  }

  const name = clean(body.name, 100);
  const email = clean(body.email, 200).toLowerCase();
  const topic = TOPICS.includes(String(body.topic)) ? String(body.topic) : 'Something else';
  const message = clean(body.message, 5000);
  const page = clean(body.page, 100);

  if (!name || !isEmail(email) || message.length < 2) {
    return NextResponse.json({ error: 'Please fill in your name, a valid email and your message.' }, { status: 400 });
  }
  if (!isEmailConfigured) {
    return NextResponse.json({ error: 'not_configured' }, { status: 503 });
  }

  const settings = await getEmailSettings(isSupabaseConfigured ? createServerClient() : null);
  const html = `<!doctype html><html><body style="margin:0;padding:24px 12px;background:#f2f2f2;font-family:Arial,Helvetica,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;">
<tr><td style="background:#000;padding:20px 24px;">
  <div style="font-family:'Courier New',monospace;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#ccff00;">Moovma · Website contact form</div>
  <div style="font-family:Georgia,serif;font-size:26px;color:#fff;margin-top:8px;">${esc(topic)}</div>
  <div style="font-size:14px;color:#bbb;margin-top:6px;">From ${esc(name)} · ${esc(email)}</div>
</td></tr>
<tr><td style="padding:22px 24px;font-size:15px;line-height:1.7;color:#000;white-space:pre-wrap;">${esc(message)}</td></tr>
<tr><td style="padding:0 24px 22px;">
  <a href="mailto:${esc(email)}?subject=${encodeURIComponent(`Re: ${topic}`)}" style="display:inline-block;padding:12px 20px;border-radius:9999px;background:#ccff00;color:#000;text-decoration:none;font-family:'Courier New',monospace;font-size:11px;letter-spacing:.06em;text-transform:uppercase;">Reply to ${esc(name)}</a>
</td></tr>
<tr><td style="padding:14px 24px 20px;border-top:1px solid #dedede;font-size:12px;color:#6b6b6b;">Sent from the contact form${page ? ` on ${esc(page)}` : ''}. Pressing Reply in your mail app answers ${esc(email)} directly.</td></tr>
</table></td></tr></table></body></html>`;
  const text = `${topic}\nFrom: ${name} <${email}>\n${page ? `Page: ${page}\n` : ''}\n${message}`;

  const res = await sendEmail({
    to: settings.send_to,
    subject: `[Elyssa contact] ${topic} · ${name}`,
    html,
    text,
    replyTo: email,
  });
  if (!res.sent) {
    console.error('Contact email not sent:', res.error);
    return NextResponse.json({ error: 'failed' }, { status: 502 });
  }
  return NextResponse.json({ sent: true });
}
