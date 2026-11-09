'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

// Lazy-load ThreeViewer only client-side (no SSR)
const ThreeViewer = dynamic(() => import('./ThreeViewer'), {
  ssr: false,
  loading: () => (
    <div className="model-frame model-sticky reveal" style={{ minHeight: '570px' }}>
      <div className="model-placeholder-loader">
        <div className="viewer-radar-loader">
          <div className="radar-ring" />
          <div className="radar-sweep" />
          <div className="radar-core" />
        </div>
        <span className="loader-status-text">3D model loading…</span>
      </div>
    </div>
  ),
});

export default function LazyThreeViewer() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.05, rootMargin: '300px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  if (!isVisible) {
    // Render an empty placeholder that reserves space so layout doesn't shift
    return (
      <div ref={ref} className="model-frame model-sticky reveal" style={{ minHeight: '570px' }} />
    );
  }

  return (
    <div ref={ref}>
      <ThreeViewer />
    </div>
  );
}