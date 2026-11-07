'use client';

import React, { useEffect, useState } from 'react';

export default function PageLoader() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const dismiss = () => {
      setFading(true);
      timer = setTimeout(() => setVisible(false), 300);
    };

    // Auto-dismiss smoothly
    const autoTimer = setTimeout(dismiss, 700);

    // Skip instantly on any user scroll or touch interaction
    const handleSkip = () => {
      dismiss();
    };

    window.addEventListener('scroll', handleSkip, { passive: true, once: true });
    window.addEventListener('wheel', handleSkip, { passive: true, once: true });
    window.addEventListener('touchmove', handleSkip, { passive: true, once: true });
    window.addEventListener('keydown', handleSkip, { passive: true, once: true });

    return () => {
      clearTimeout(autoTimer);
      clearTimeout(timer);
      window.removeEventListener('scroll', handleSkip);
      window.removeEventListener('wheel', handleSkip);
      window.removeEventListener('touchmove', handleSkip);
      window.removeEventListener('keydown', handleSkip);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`page-loader-overlay${fading ? ' is-fading' : ''}`}
      onClick={() => {
        setFading(true);
        setTimeout(() => setVisible(false), 300);
      }}
      aria-hidden="true"
    >
      <div className="viewer-radar-loader">
        <div className="radar-ring"></div>
        <div className="radar-sweep"></div>
        <div className="radar-core"></div>
      </div>
      <span className="page-loader-text">INITIALIZING ELYSSA</span>
    </div>
  );
}
