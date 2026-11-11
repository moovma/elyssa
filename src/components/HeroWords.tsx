'use client';

import { useEffect, useState } from 'react';

/** Rotates through a list of words with a vertical slide. Shows the first word without JS. */
export default function HeroWords({ words, interval = 2200 }: { words: string[]; interval?: number }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setI((n) => (n + 1) % words.length), interval);
    return () => clearInterval(t);
  }, [words.length, interval]);

  return (
    <span className="hero-words" aria-live="polite">
      <span key={i} className="hero-word">{words[i]}</span>
    </span>
  );
}
