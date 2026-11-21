/**
 * The public address of the website (used for link previews, the sitemap and robots.txt).
 * Change it in ONE place: NEXT_PUBLIC_SITE_URL in Vercel (Settings > Environment Variables), then redeploy.
 * Default: the official domain www.moovma.tn (moovma.tn shows the same site; canonical URLs point to www).
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.moovma.tn';
