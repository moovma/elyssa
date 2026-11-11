'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export interface WorkItemView {
  src: string;
  full: string;
  width: number;
  height: number;
  title: string;
  tag: string;
  blurb: string;
}

/** Poster grid with tag filters and a keyboard-friendly lightbox. */
export default function WorkGallery({ items }: { items: WorkItemView[] }) {
  const tags = useMemo(() => ['All', ...Array.from(new Set(items.map((i) => i.tag)))], [items]);
  const [tag, setTag] = useState('All');
  const [open, setOpen] = useState<number | null>(null);
  const touchX = useRef<number | null>(null);

  const shown = useMemo(() => items.filter((i) => tag === 'All' || i.tag === tag), [items, tag]);

  const close = useCallback(() => setOpen(null), []);
  const step = useCallback(
    (d: number) => setOpen((o) => (o === null ? o : (o + d + shown.length) % shown.length)),
    [shown.length]
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, close, step]);

  const current = open !== null ? shown[open] : null;

  return (
    <>
      {tags.length > 2 && (
        <div className="work-filters" role="tablist" aria-label="Filter projects">
          {tags.map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tag === t}
              className={`work-filter${tag === t ? ' is-active' : ''}`}
              onClick={() => setTag(t)}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      <div className="work-grid">
        {shown.map((item, i) => (
          <button
            key={item.src}
            type="button"
            className="work-card"
            style={{ ['--i' as string]: i }}
            onClick={() => setOpen(i)}
            aria-label={`Open poster: ${item.title}`}
          >
            <span className="work-img" style={{ aspectRatio: `${item.width} / ${item.height}` }}>
              <img src={item.src} alt={`${item.title} poster`} width={item.width} height={item.height} loading="lazy" decoding="async" />
            </span>
            <span className="work-meta">
              <small>{item.tag}</small>
              <strong>{item.title}</strong>
            </span>
          </button>
        ))}
      </div>

      {current && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={current.title} onClick={close}
          onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
          onTouchEnd={(e) => {
            if (touchX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            touchX.current = null;
            if (Math.abs(dx) > 60) step(dx < 0 ? 1 : -1); // swipe left = next, right = previous
          }}
        >
          <div className="lightbox-inner" onClick={(e) => e.stopPropagation()}>
            <img src={current.src} alt={`${current.title} poster`} />
            <div className="lightbox-caption">
              <small>{current.tag}</small>
              <h3>{current.title}</h3>
              {current.blurb && <p>{current.blurb}</p>}
              <a className="text-link" href={current.full} target="_blank" rel="noreferrer">Open full size ↗</a>
            </div>
          </div>
          <button type="button" className="lightbox-btn lightbox-close" onClick={close} aria-label="Close">✕</button>
          {shown.length > 1 && (
            <>
              <button type="button" className="lightbox-btn lightbox-prev" onClick={(e) => { e.stopPropagation(); step(-1); }} aria-label="Previous">←</button>
              <button type="button" className="lightbox-btn lightbox-next" onClick={(e) => { e.stopPropagation(); step(1); }} aria-label="Next">→</button>
            </>
          )}
        </div>
      )}
    </>
  );
}
