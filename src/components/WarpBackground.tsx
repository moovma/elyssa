'use client';

import { useEffect, useRef } from 'react';

/**
 * "Warp speed" background: light streaks shooting out from the centre of a black screen.
 * Used behind the pre-order confirmation. Brand colours only (white/grey + a few acid streaks).
 * Plain canvas, no library. Pauses when the tab is hidden; a single still frame with reduced motion.
 */

interface Streak {
  angle: number;
  dist: number; // distance of the streak's tail from the centre, in px
  speed: number; // px per second at dist = 0 (it accelerates outward)
  len: number; // length factor
  width: number;
  color: string;
  alpha: number;
}

const COLORS = ['255,255,255', '255,255,255', '210,210,210', '160,160,160', '204,255,0'];
const BEAM_COLORS = ['255,255,255', '204,255,0', '120,120,120'];

export default function WarpBackground() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0;
    let h = 0;
    let maxR = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      maxR = Math.hypot(w, h) / 2 + 40;
    };
    resize();

    const count = Math.round(Math.min(260, Math.max(110, (w * h) / 6000)));
    const make = (spread: boolean): Streak => {
      const beam = Math.random() < 0.12; // a few wide, soft beams like the reference
      return {
        angle: Math.random() * Math.PI * 2,
        dist: spread ? Math.random() * maxR : Math.random() * 30,
        speed: 40 + Math.random() * 120,
        len: beam ? 0.8 + Math.random() * 0.8 : 0.3 + Math.random() * 0.6,
        width: beam ? 10 + Math.random() * 22 : 0.8 + Math.random() * 2,
        color: beam
          ? BEAM_COLORS[Math.floor(Math.random() * BEAM_COLORS.length)]
          : COLORS[Math.floor(Math.random() * COLORS.length)],
        alpha: beam ? 0.12 + Math.random() * 0.16 : 0.5 + Math.random() * 0.5,
      };
    };
    const streaks: Streak[] = Array.from({ length: count }, () => make(true));

    const draw = (dt: number) => {
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, w, h);
      // soft glow in the middle
      const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, maxR * 0.6);
      g.addColorStop(0, 'rgba(255,255,255,0.1)');
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round';
      const cx = w / 2;
      const cy = h / 2;
      for (let i = 0; i < streaks.length; i++) {
        const s = streaks[i];
        // accelerate as it moves out, like flying through stars
        s.dist += (s.speed + s.dist * 1.6) * dt;
        if (s.dist > maxR) {
          streaks[i] = make(false);
          continue;
        }
        const t = s.dist / maxR; // 0 at the centre, 1 at the edge
        const head = s.dist + s.dist * s.len + 4;
        const cos = Math.cos(s.angle);
        const sin = Math.sin(s.angle);
        const x1 = cx + cos * s.dist;
        const y1 = cy + sin * s.dist;
        const x2 = cx + cos * head;
        const y2 = cy + sin * head;
        const a = s.alpha * Math.min(1, t * 3);
        const grad = ctx.createLinearGradient(x1, y1, x2, y2);
        grad.addColorStop(0, `rgba(${s.color},0)`);
        grad.addColorStop(1, `rgba(${s.color},${a.toFixed(3)})`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = s.width * (0.4 + t);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
    };

    if (reduced) {
      draw(0);
      const onResize = () => {
        resize();
        draw(0);
      };
      window.addEventListener('resize', onResize);
      return () => window.removeEventListener('resize', onResize);
    }

    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      draw(dt);
      raf = requestAnimationFrame(tick);
    };
    const start = () => {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const onVisibility = () => (document.hidden ? stop() : start());
    draw(0);
    start();
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      stop();
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return <canvas ref={ref} className="warp-bg" aria-hidden="true" />;
}
