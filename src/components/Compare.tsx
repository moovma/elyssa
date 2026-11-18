'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ADDONS, BOARDS, NEEDS, PRESETS, extrasFor,
  type BoardId, type NeedId,
} from '../lib/compare';
import { track } from '../lib/track';
import SpecScroll from './SpecScroll';

/** A number that glides to its new value. */
function Num({ value }: { value: number }) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    if (document.hidden || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(value);
      from.current = value;
      return;
    }
    const start = performance.now();
    const a = from.current;
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min((now - start) / 600, 1);
      const v = Math.round(a + (value - a) * (1 - Math.pow(1 - p, 3)));
      setShown(v);
      from.current = v;
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    // Always land on the true value, even if the browser pauses animation frames
    const done = window.setTimeout(() => {
      cancelAnimationFrame(raf);
      setShown(value);
      from.current = value;
    }, 700);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(done);
    };
  }, [value]);
  return <>{shown}</>;
}

/** A horizontal bar. `fill` is 0..1. */
function Bar({ fill, tone }: { fill: number; tone: 'acid' | 'ink' | 'grey' }) {
  const pct = fill <= 0 ? 0 : Math.max(2, Math.min(100, fill * 100));
  return (
    <span className="cmp-bar">
      <span className={`cmp-bar-fill is-${tone}`} style={{ '--w': `${pct}%` } as React.CSSProperties} />
    </span>
  );
}

export default function Compare() {
  const [needs, setNeeds] = useState<NeedId[]>(PRESETS[0].needs);
  const [inView, setInView] = useState(false);
  const rootRef = useRef<HTMLElement>(null);

  // Bars grow in the first time the section is on screen
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const data = useMemo(() => {
    const per = BOARDS.map((b) => {
      const extras = extrasFor(b.id, needs);
      const inside = NEEDS.filter((n) => needs.includes(n.id) && n.extras[b.id].length === 0);
      const wires = extras.reduce((s, a) => s + ADDONS[a].wires, 0);
      return { board: b, extras, inside, wires };
    });
    const maxExtras = Math.max(1, ...per.map((p) => p.extras.length));
    const maxWires = Math.max(1, ...per.map((p) => p.wires));
    const fewest = Math.min(...per.map((p) => p.extras.length));
    return { per, maxExtras, maxWires, fewest };
  }, [needs]);

  const activePreset = PRESETS.find((p) => p.needs.length === needs.length && p.needs.every((n) => needs.includes(n)));

  const toggle = (id: NeedId) =>
    setNeeds((cur) => (cur.includes(id) ? cur.filter((n) => n !== id) : NEEDS.map((n) => n.id).filter((n) => n === id || cur.includes(n))));

  const pickPreset = (id: string) => {
    const p = PRESETS.find((x) => x.id === id);
    if (!p) return;
    setNeeds(p.needs);
    track('compare_preset', { preset: p.id });
  };

  const total = needs.length;
  const g = (v: number) => (inView ? v : 0);

  const summary = total
    ? data.per.map((p) => `${p.board.name}: ${p.extras.length === 0 ? 'ready, nothing extra' : `${p.extras.length} extra parts`}`).join('. ') + '.'
    : 'Pick at least one thing your project should do.';

  return (
    <section className={`compare-section${inView ? ' is-in' : ''}`} id="compare" ref={rootRef}>
      <div className="section-wrap">
        <div className="section-label reveal">
          <span>02</span>
          <span>Side by side</span>
        </div>

        <div className="compare-heading">
          <h2 className="reveal">Which board is <em>ready</em><br />for your idea?</h2>
          <p className="reveal delay-one">
            Pick something to make. We show what each board already has inside, and what you would still have to buy and wire.
            Fewer extra parts means you start building sooner.
          </p>
        </div>

        {/* STEP 1 */}
        <div className="cmp-step">
          <span className="cmp-step-n">1</span>
          <h3>What do you want to make?</h3>
        </div>
        <div className="cmp-presets" role="group" aria-label="Example projects">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`cmp-preset${activePreset?.id === p.id ? ' is-on' : ''}`}
              aria-pressed={activePreset?.id === p.id}
              onClick={() => pickPreset(p.id)}
            >
              <strong>{p.label}</strong>
              <span>{p.hint}</span>
            </button>
          ))}
        </div>
        <p className="cmp-or">Or pick what it should do:</p>
        <div className="cmp-needs" role="group" aria-label="What your project should do">
          {NEEDS.map((n) => {
            const on = needs.includes(n.id);
            return (
              <button key={n.id} type="button" className={`cmp-chip${on ? ' is-on' : ''}`} aria-pressed={on} onClick={() => toggle(n.id)}>
                <span className="cmp-check" aria-hidden="true">{on ? '✓' : '+'}</span>
                <span>
                  {n.label}
                  <small>{n.tech}</small>
                </span>
              </button>
            );
          })}
        </div>

        {/* STEP 2 */}
        <div className="cmp-step">
          <span className="cmp-step-n">2</span>
          <h3>What each board needs</h3>
        </div>
        <p className="sr-only" aria-live="polite">{summary}</p>
        <div className="cmp-cards">
          {data.per.map((p) => {
            const ready = total > 0 && p.extras.length === 0;
            const easiest = total > 0 && p.extras.length === data.fewest;
            const isEly = p.board.id === 'elyssa';
            return (
              <article key={p.board.id} className={`cmp-card${isEly ? ' is-elyssa' : ''}${ready ? ' is-ready' : ''}`}>
                <header>
                  <h4>{p.board.name}</h4>
                  {easiest && <span className="cmp-badge">{ready ? 'Ready to go' : 'Easiest'}</span>}
                </header>

                <div className="cmp-big">
                  <span className={`cmp-big-n${total ? (p.extras.length === 0 ? ' is-zero' : ' is-more') : ''}`}>
                    <Num value={total ? p.extras.length : 0} />
                  </span>
                  <span className="cmp-big-l">extra part{p.extras.length === 1 ? '' : 's'} to buy</span>
                </div>

                <div className="cmp-meter">
                  <div className="cmp-meter-top">
                    <span>Already inside</span>
                    <strong><Num value={p.inside.length} /> of {total}</strong>
                  </div>
                  <Bar fill={g(total ? p.inside.length / total : 0)} tone={isEly ? 'acid' : 'ink'} />
                </div>
                <div className="cmp-meter">
                  <div className="cmp-meter-top">
                    <span>Extra parts</span>
                    <strong><Num value={p.extras.length} /></strong>
                  </div>
                  <Bar fill={g(p.extras.length / data.maxExtras)} tone="grey" />
                </div>
                <div className="cmp-meter">
                  <div className="cmp-meter-top">
                    <span>Wires to connect</span>
                    <strong>{p.wires ? <>about <Num value={p.wires} /></> : '0'}</strong>
                  </div>
                  <Bar fill={g(p.wires / data.maxWires)} tone="grey" />
                </div>

                {p.extras.length > 0 ? (
                  <ul className="cmp-list">
                    {p.extras.map((a) => <li key={a}>{ADDONS[a].label}</li>)}
                  </ul>
                ) : (
                  <p className="cmp-none">{total ? 'Nothing to add. Plug it in and start.' : 'Pick something above.'}</p>
                )}
                <p className="cmp-strength"><span>Best at</span>{p.board.strength}</p>
              </article>
            );
          })}
        </div>

        <div className="cmp-step">
          <span className="cmp-step-n">3</span>
          <h3>Spec by spec</h3>
        </div>
        <SpecScroll />

        <div className="compare-foot">
          <p>
            Specs come from each maker&apos;s official documents. Extra parts and wire counts are typical choices, so your
            project may differ. All three are good boards: pick the one that fits your idea.
          </p>
          <div className="compare-foot-actions">
            <Link href="/docs" className="button" onClick={() => track('click_docs', { from: 'compare' })}>
              See every Elyssa pin <span>→</span>
            </Link>
            <Link href="/preorder" className="button button-acid" onClick={() => track('click_preorder', { from: 'compare' })}>
              Reserve your Elyssa <span>→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
