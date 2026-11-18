'use client';

import { useEffect, useRef } from 'react';
import { BOARDS, SPEC_ROWS } from '../lib/compare';

/**
 * The spec sheet, one row at a time: as you scroll, the row in the middle of the screen
 * grows to full size and the others shrink and fade. Driven by a CSS variable --p (0..1) per row.
 * With reduced motion every row stays at full size.
 */
export default function SpecScroll() {
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const rows = Array.from(list.children) as HTMLElement[];
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      rows.forEach((r) => r.style.setProperty('--p', '1'));
      return;
    }

    // Runs straight from the scroll event (only 14 rows, so it stays cheap) rather than waiting for
    // an animation frame or an observer, so rows never get stuck faded if the browser pauses those.
    const update = () => {
      const top = list.getBoundingClientRect();
      if (top.bottom < -200 || top.top > window.innerHeight + 200) return; // section far off screen
      const mid = window.innerHeight / 2;
      const reach = window.innerHeight * 0.75; // distance at which a row is fully shrunk
      rows.forEach((r) => {
        const b = r.getBoundingClientRect();
        const d = Math.abs(b.top + b.height / 2 - mid);
        const p = Math.max(0, 1 - d / reach);
        const eased = p * p * (3 - 2 * p); // smoothstep
        r.style.setProperty('--p', eased.toFixed(3));
        r.classList.toggle('is-current', p > 0.75);
      });
    };
    const onScroll = () => update();
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <ol className="spec-scroll" ref={listRef} aria-label="Spec by spec">
      {SPEC_ROWS.map((r, i) => (
        <li key={r.label} className="spec-scroll-row">
          <div className="spec-scroll-inner">
            <div className="spec-scroll-head">
              <span className="spec-scroll-n">{String(i + 1).padStart(2, '0')} / {SPEC_ROWS.length}</span>
              <h4>{r.plain}</h4>
              <span className="spec-scroll-tech">{r.label}</span>
            </div>
            <dl className="spec-scroll-vals">
              {BOARDS.map((b) => {
                const v = r.values[b.id];
                const none = v === 'None' || v === 'No';
                return (
                  <div key={b.id} className={`${b.id === 'elyssa' ? 'is-elyssa' : ''}${none ? ' is-none' : ''}`}>
                    <dt>{b.short}</dt>
                    <dd>{none ? `— ${v}` : v}</dd>
                    {b.id === 'elyssa' && r.note && <p className="spec-scroll-note">{r.note}</p>}
                  </div>
                );
              })}
            </dl>
          </div>
        </li>
      ))}
    </ol>
  );
}
