'use client';

import { useEffect } from 'react';
import { track } from '../lib/track';

const SOCIALS: Record<string, string> = {
  'github.com': 'github',
  'instagram.com': 'instagram',
  'youtube.com': 'youtube',
  'linkedin.com': 'linkedin',
};

/**
 * Tracks the important clicks on the whole site with one listener (no markup changes needed):
 * pre-order / shop / docs buttons, downloads, e-mail links and social links.
 */
export default function AnalyticsEvents() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.('a');
      if (!a) return;
      const href = a.getAttribute('href') || '';
      const page = window.location.pathname;
      const label = (a.textContent || '').trim().slice(0, 40);

      if (a.hasAttribute('download')) return track('download', { file: href.split('/').pop() || href, page });
      if (href.startsWith('mailto:')) return track('click_email', { page });
      if (href.startsWith('/preorder')) return track('click_preorder', { page, label });
      if (href.startsWith('/shop')) return track('click_shop', { page });
      if (href.startsWith('/docs')) return track('click_docs', { page });
      if (href.startsWith('/elyssa')) return track('click_elyssa_overview', { page });

      if (/^https?:/.test(href)) {
        try {
          const host = new URL(href).hostname.replace(/^www\./, '');
          const social = SOCIALS[host];
          if (social) return track('click_social', { network: social, page });
          if (host !== window.location.hostname) return track('click_external', { host, page });
        } catch {
          /* ignore bad urls */
        }
      }
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return null;
}
