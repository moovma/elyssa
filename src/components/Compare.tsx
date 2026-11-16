'use client';

import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { BicepsFlexed, Brain, Snail } from 'lucide-react';
import {
  COMPARE_BOARDS,
  FEATURES,
  PROJECTS,
  SPEC_ROWS,
  addOnName,
  missingFor,
  type BoardKey,
} from '../lib/compare';
import { track } from '../lib/track';

const CompareBoard3D = dynamic(() => import('./CompareBoard3D'), { ssr: false });

const ICONS: Record<BoardKey, React.ReactNode> = {
  uno: <Snail size={16} strokeWidth={1.6} />,
  devkit: <Brain size={16} strokeWidth={1.6} />,
  elyssa: (
    <>
      <Brain size={16} strokeWidth={1.6} />
      <BicepsFlexed size={16} strokeWidth={1.6} />
    </>
  ),
};

const plural = (n: number) => `${n} extra part${n === 1 ? '' : 's'}`;

export default function Compare() {
  const [projectKey, setProjectKey] = useState(PROJECTS[0].key);
  const project = PROJECTS.find((p) => p.key === projectKey) ?? PROJECTS[0];
  const sectionRef = useRef<HTMLElement>(null);
  const [near, setNear] = useState(false);

  // Only download three.js when the section is close to the screen.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setNear(true);
      return;
    }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setNear(true);
        io.disconnect();
      }
    }, { rootMargin: '600px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const pick = (key: string) => {
    if (key === projectKey) return;
    setProjectKey(key);
    track('compare_project', { project: key });
  };

  const missing = Object.fromEntries(COMPARE_BOARDS.map((b) => [b.key, missingFor(b, project)])) as Record<BoardKey, ReturnType<typeof missingFor>>;
  const others = COMPARE_BOARDS.filter((b) => b.key !== 'elyssa')
    .map((b) => (missing[b.key].length ? `the ${b.name} needs ${plural(missing[b.key].length)}` : `the ${b.name} is ready too`))
    .reverse();

  return (
    <section className="compare-section" id="compare" ref={sectionRef}>
      <div className="section-wrap">
        <div className="section-label reveal">
          <span>03</span>
          <span>How it compares</span>
        </div>
        <div className="spec-heading compare-heading">
          <h2 className="reveal">Smart is good.<br /><em>Smart and strong wins.</em></h2>
          <p className="reveal delay-one">
            Picture three teammates for your next project. One is slow. One is clever but shows up empty-handed. One
            brings the brains <em>and</em> the muscle. Pick a project and see who is ready.
          </p>
        </div>

        <div className="cmp-picker reveal">
          <span className="cmp-picker-label">Pick a project</span>
          <div className="cmp-chips" role="group" aria-label="Pick a project">
            {PROJECTS.map((p) => (
              <button
                key={p.key}
                type="button"
                className={`cmp-chip${p.key === projectKey ? ' is-on' : ''}`}
                aria-pressed={p.key === projectKey}
                onClick={() => pick(p.key)}
              >
                {p.name}
              </button>
            ))}
          </div>
          <p className="cmp-summary" aria-live="polite">
            <strong>{project.name}:</strong> Elyssa is ready out of the box. {others.join(', ').replace(/^t/, 'T')}.
          </p>
        </div>

        <div className="cmp-cards">
          {COMPARE_BOARDS.map((b, i) => {
            const miss = missing[b.key];
            const hero = b.key === 'elyssa';
            return (
              <article key={b.key} className={`cmp-card${hero ? ' is-hero' : ''} reveal${i ? ` delay-${i === 1 ? 'one' : 'two'}` : ''}`}>
                <div className="cmp-stage">
                  {near && <CompareBoard3D kind={b.key} extras={miss.length} pulse={projectKey} />}
                  <span className={`cmp-badge${miss.length ? '' : ' is-ready'}`}>
                    {miss.length ? `+${miss.length} to add` : 'Ready'}
                  </span>
                  {b.key !== 'elyssa' && <span className="cmp-stage-note">Illustration</span>}
                </div>

                <div className="cmp-card-body">
                  <span className="cmp-persona">
                    <span className="cmp-icons" aria-hidden="true">{ICONS[b.key]}</span>
                    {b.persona}
                  </span>
                  <h3>{b.name}</h3>
                  <p className="cmp-verdict">{b.verdict}.</p>
                  <p className="cmp-story">{b.story}</p>

                  <div className="cmp-meter">
                    <div className="cmp-meter-head">
                      <span>Brain</span>
                      <span>{b.brain}</span>
                    </div>
                    <div className="cmp-bar" role="img" aria-label={`Processing: ${b.brain}`}>
                      <i style={{ width: `${Math.max(4, b.brainScore * 100)}%` }} />
                    </div>
                    <span className="cmp-meter-sub">{b.memory}</span>
                  </div>

                  <div className="cmp-meter">
                    <div className="cmp-meter-head">
                      <span>Muscle (built in)</span>
                      <span>{b.builtIn.length} / {FEATURES.length}</span>
                    </div>
                    <ul className="cmp-feats">
                      {FEATURES.map((f) => {
                        const has = b.builtIn.includes(f.key);
                        const needed = project.needs.includes(f.key);
                        const state = has ? 'has' : needed ? 'missing' : 'off';
                        return (
                          <li key={f.key} className={`is-${state}${needed ? ' is-needed' : ''}`}>
                            {state === 'missing' ? '+ ' : ''}{f.name}
                            <span className="sr-only">{has ? ' (on the board)' : needed ? ' (missing for this project)' : ' (not on the board)'}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  <div className={`cmp-result${miss.length ? '' : ' is-ready'}`} key={projectKey}>
                    {miss.length ? (
                      <>
                        <strong>+{plural(miss.length)} to buy and wire</strong>
                        <span>{miss.map(addOnName).join(' · ')}</span>
                      </>
                    ) : (
                      <>
                        <strong>Ready out of the box</strong>
                        <span>{hero ? 'Plug in USB-C and start coding.' : 'Everything this project needs is on the board.'}</span>
                      </>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <details className="cmp-details">
          <summary>See every spec side by side</summary>
          <div className="cmp-wrap">
            <table className="cmp-table">
              <caption className="sr-only">Elyssa compared with the ESP32-S3 DevKit and the Arduino Uno R3</caption>
              <thead>
                <tr>
                  <th scope="col"><span className="sr-only">Feature</span></th>
                  <th scope="col" className="cmp-elyssa">Elyssa</th>
                  <th scope="col">ESP32-S3 DevKit</th>
                  <th scope="col">Arduino Uno R3</th>
                </tr>
              </thead>
              <tbody>
                {SPEC_ROWS.map((r) => (
                  <tr key={r.name}>
                    <th scope="row">{r.name}</th>
                    {(['elyssa', 'devkit', 'uno'] as const).map((k) => (
                      <td key={k} data-label={k === 'elyssa' ? 'Elyssa' : k === 'devkit' ? 'ESP32-S3 DevKit' : 'Arduino Uno R3'} className={k === 'elyssa' ? 'cmp-elyssa' : undefined}>
                        {r[k] ?? <span className="cmp-no" aria-label="Not on the board">—</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>

        <p className="cmp-note">
          Based on the public specs of the official Espressif ESP32-S3-DevKitC-1 and the Arduino Uno R3. Other versions
          and clones can differ. The Uno and DevKit models are simplified illustrations, not to scale. Drag a board to
          turn it. Full Elyssa details are in the <a href="/docs">docs</a>.
        </p>
      </div>
    </section>
  );
}
