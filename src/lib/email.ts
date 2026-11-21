/**
 * Server-side email sending through Resend (https://resend.com), plus the email switches stored in Supabase.
 * Env: RESEND_API_KEY (required to send), EMAIL_FROM (optional), NOTIFY_EMAIL (fallback address).
 * Never import this file in client components.
 */
import type { SupabaseClient } from '@supabase/supabase-js';

export const DEFAULT_NOTIFY_EMAIL = process.env.NOTIFY_EMAIL || 'moovmabh@gmail.com';
// Until a domain is verified in Resend, only this test sender works (and only to the Resend account's own email).
const EMAIL_FROM = process.env.EMAIL_FROM || 'Moovma <onboarding@resend.dev>';

export const isEmailConfigured = Boolean(process.env.RESEND_API_KEY);

export interface SendResult {
  sent: boolean;
  error?: string;
}

export async function sendEmail(opts: { to: string; subject: string; html: string; text: string; replyTo?: string }): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { sent: false, error: 'RESEND_API_KEY is not set' };
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: [opts.to],
        subject: opts.subject,
        html: opts.html,
        text: opts.text,
        ...(opts.replyTo ? { reply_to: opts.replyTo } : {}),
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return { sent: false, error: `Resend ${res.status}: ${(await res.text()).slice(0, 300)}` };
    return { sent: true };
  } catch (e) {
    return { sent: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export interface EmailSettings {
  notify_each_preorder: boolean;
  daily_report: boolean;
  send_to: string;
  last_daily_sent_at: string | null;
}

const DEFAULTS: EmailSettings = {
  notify_each_preorder: true,
  daily_report: true,
  send_to: DEFAULT_NOTIFY_EMAIL,
  last_daily_sent_at: null,
};

/** Reads the one row of public.email_settings (supabase_email_settings.sql). Falls back to defaults if missing. */
export async function getEmailSettings(supabase: SupabaseClient | null): Promise<EmailSettings> {
  if (!supabase) return DEFAULTS;
  const { data, error } = await supabase.from('email_settings').select('*').eq('id', 1).maybeSingle();
  if (error || !data) return DEFAULTS;
  return {
    notify_each_preorder: data.notify_each_preorder ?? true,
    daily_report: data.daily_report ?? true,
    send_to: (data.send_to || '').trim() || DEFAULT_NOTIFY_EMAIL,
    last_daily_sent_at: data.last_daily_sent_at ?? null,
  };
}
