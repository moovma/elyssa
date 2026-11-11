import { track as vercelTrack } from '@vercel/analytics';

/** Sends a custom event to Vercel Analytics. Never throws, never blocks the page. */
export function track(name: string, data?: Record<string, string | number | boolean | null>) {
  try {
    vercelTrack(name, data);
  } catch {
    /* analytics must never break the site */
  }
}
