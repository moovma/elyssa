/**
 * The public address of the website (used for link previews, the sitemap and robots.txt).
 * Change it in ONE place: NEXT_PUBLIC_SITE_URL in Vercel (Settings > Environment Variables), then redeploy.
 * Default: the official domain. moovma.tn redirects to www.moovma.tn (set in Vercel > Domains).
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.moovma.tn';
