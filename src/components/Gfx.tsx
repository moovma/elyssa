import type { CSSProperties } from 'react';

export type GfxShape = 'clover' | 'wave' | 'blocks' | 'gem' | 'pinwheel';
/**
 * Colours are black-to-white only:
 *   light steps for white sections:  g1 (lightest) g2 g3
 *   dark steps for black sections:   d1 (darkest)  d2 d3
 *   plus ink / white, and the brand acid (used once, on the home hero).
 */
export type GfxColor = 'acid' | 'ink' | 'white' | 'g1' | 'g2' | 'g3' | 'd1' | 'd2' | 'd3';

interface GfxProps {
  shape: GfxShape;
  color?: GfxColor;
  /** width in px */
  size?: number;
  top?: number | string;
  left?: number | string;
  right?: number | string;
  bottom?: number | string;
  /** static rotation in degrees */
  rotate?: number;
  /** turn very slowly */
  spin?: boolean;
}

/** Aligns a shape with the right edge of the page content (1180 px wide, centred). */
export const CONTENT_RIGHT = 'max(24px, calc((100% - 1180px) / 2))';

/**
 * A quiet decorative shape from public/graphics/shapes (vector, see scripts/remake-graphics.mjs).
 * Only shown on screens 1000 px and wider, where there is free space beside the content.
 * Purely visual: ignored by screen readers and never blocks clicks.
 */
export default function Gfx({ shape, color = 'g2', size = 140, top, left, right, bottom, rotate = 0, spin }: GfxProps) {
  const style = { top, left, right, bottom, '--w': `${size}px`, '--rot': `${rotate}deg` } as CSSProperties;
  return (
    <span className={`gfx gfx-${shape} gfx-c-${color}`} style={style} aria-hidden="true" data-gfx>
      <span className={`gfx-shape${spin ? ' gfx-spin-slow' : ''}`} />
    </span>
  );
}
