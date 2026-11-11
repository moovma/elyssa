'use client';

import { useRef, useState } from 'react';

export default function ShopGallery({ images }: { images: { src: string; alt: string }[] }) {
  const [active, setActive] = useState(0);
  const touchX = useRef<number | null>(null);
  const current = images[active] ?? images[0];
  if (!current) return null;

  return (
    <div className="shop-gallery">
      <div
        className="shop-stage"
        onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          if (touchX.current === null || images.length < 2) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          touchX.current = null;
          if (Math.abs(dx) > 50) setActive((i) => (i + (dx < 0 ? 1 : -1) + images.length) % images.length); // swipe
        }}
      >
        <img key={current.src} src={current.src} alt={current.alt} />
        {images.length > 1 && (
          <span className="shop-count">{String(active + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}</span>
        )}
      </div>
      {images.length > 1 && (
        <div className="shop-thumbs" role="tablist" aria-label="Product images">
          {images.map((img, i) => (
            <button
              key={img.src}
              type="button"
              role="tab"
              aria-selected={i === active}
              className={`shop-thumb${i === active ? ' is-active' : ''}`}
              onClick={() => setActive(i)}
              aria-label={`Show image ${i + 1}`}
            >
              <img src={img.src} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
