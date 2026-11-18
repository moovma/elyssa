'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { HEADER_PINS, PIN_CAPS, PIN_SAFETY, type PinSafety } from '../lib/elyssa-docs';

const SAFETY_LABEL = { safe: 'Safe', caution: 'Caution', reserved: 'Reserved' } as const;

/** GPIO numbers listed in a PIN_SAFETY row, e.g. "1 – 6" or "34 / 35 / 36 / 37". */
function gpiosOf(row: PinSafety): number[] {
  const range = row.gpio.match(/^(\d+)\s*–\s*(\d+)$/);
  if (range) {
    const out: number[] = [];
    for (let g = +range[1]; g <= +range[2]; g++) out.push(g);
    return out;
  }
  return row.gpio.split('/').map((s) => parseInt(s, 10)).filter((n) => !Number.isNaN(n));
}

const norm = (s: string) => s.toLowerCase().replace(/[\s_\-()]/g, '');

interface Entry {
  key: string;
  name: string;
  /** "Pin 4 of 22 on the header" or "Not on the header". */
  where: string;
  gpio?: number;
  safety?: PinSafety;
  detail: string;
  adc?: string;
  touch?: string;
  sketch?: string;
  aliases: string[];
}

/** Silkscreen label -> constant name in pins_arduino.h, where they differ. */
const SKETCH_NAME: Record<string, string> = { Tx: 'TX', Rx: 'RX', CS: 'SS', CLK: 'SCK' };

/** One entry per header pin, plus the on-board pins that are not on the header. */
function buildEntries(): Entry[] {
  const entries: Entry[] = HEADER_PINS.map((p) => {
    const safety = p.gpio !== undefined ? PIN_SAFETY.find((r) => gpiosOf(r).includes(p.gpio as number)) : undefined;
    const cap = PIN_CAPS.find((c) => c.gpio === p.gpio);
    const aliases = [p.label, ...(p.gpio !== undefined ? [`gpio${p.gpio}`, String(p.gpio)] : [])];
    p.detail.split(/[·\s()]+/).forEach((word) => {
      if (/^[A-Z]\d+$/.test(word) || /^[A-Z][A-Z0-9_]{2,}$/.test(word)) aliases.push(word); // A0, T0, UART, SPI, I2C, BAT_SENSE …
    });
    // This pin's own names in a sketch (the safety table lists them per group, e.g. "IO0…IO5")
    const own = SKETCH_NAME[p.label] ?? p.label;
    const sketch = p.gpio === undefined ? undefined : [own, ...aliases.filter((a) => /^[AT]\d+$/.test(a))].join(' · ');
    if (p.label === '+3.3') aliases.push('3.3', '3v3', '3.3v');
    if (p.label === 'Gnd') aliases.push('ground');
    return {
      key: `h${p.n}`,
      name: p.label,
      where: `Pin ${p.n} of ${HEADER_PINS.length} on the header`,
      gpio: p.gpio,
      safety,
      detail: p.detail,
      adc: cap?.adc,
      touch: cap?.touch,
      sketch,
      aliases,
    };
  });
  // On-board pins that are not on the header
  PIN_SAFETY.filter((r) => r.safety === 'reserved').forEach((r, i) => {
    const words = r.sketch.split(/[·/]/).map((s) => s.replace(/\(.*?\)/g, '').trim()).filter(Boolean);
    entries.push({
      key: `r${i}`,
      name: r.pin,
      where: 'On the board, not on the header',
      safety: r,
      detail: '',
      sketch: r.sketch,
      aliases: [r.pin, ...r.pin.split(/[/(),]/), ...words, ...gpiosOf(r).map((g) => `gpio${g}`)],
    });
  });
  return entries;
}

const EXAMPLES = ['IO3', 'SDA', 'PWM1', 'GPIO7', 'Vin', 'BOOT'];

export default function PinFinder() {
  const entries = useMemo(buildEntries, []);
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const q = norm(query);
  const matches = useMemo(() => {
    if (!q) return [];
    const exact = entries.filter((e) => e.aliases.some((a) => norm(a) === q));
    if (exact.length) return exact;
    return entries.filter((e) => e.aliases.some((a) => norm(a).startsWith(q)) || norm(e.name).includes(q));
  }, [entries, q]);

  // One answer when there is one match, or several that share a name (Gnd appears twice on the header).
  // Otherwise offer the matches as chips to pick from.
  const single = matches.length > 0 && matches.every((m) => m.name === matches[0].name) ? matches[0] : null;
  const result = (picked && entries.find((e) => e.key === picked)) || single;
  const suggestions = !single && matches.length > 1 ? matches.slice(0, 12) : [];

  useEffect(() => setPicked(null), [query]);

  const openTable = () => dialogRef.current?.showModal();
  const closeTable = () => dialogRef.current?.close();

  return (
    <div className="pin-finder">
      <div className="pin-finder-bar">
        <div className="pin-finder-field">
          <label htmlFor="pin-finder-input">Type a pin name</label>
          <div className="pin-finder-input-wrap">
            <input
              id="pin-finder-input"
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. IO3, SDA, GPIO7, A2"
              autoComplete="off"
              spellCheck={false}
              enterKeyHint="search"
            />
            {query && (
              <button
                type="button"
                className="pin-finder-clear"
                aria-label="Clear the search"
                onClick={() => {
                  setQuery('');
                  inputRef.current?.focus();
                }}
              >
                Clear
              </button>
            )}
          </div>
        </div>
        <button type="button" className="button pin-finder-table-btn" onClick={openTable}>
          Show full table <span>⊞</span>
        </button>
      </div>

      <div className="pin-finder-chips" aria-label="Pick a pin">
        {(q ? [] : EXAMPLES).map((ex) => (
          <button key={ex} type="button" className="pin-chip" onClick={() => setQuery(ex)}>{ex}</button>
        ))}
        {suggestions.map((m) => (
          <button key={m.key} type="button" className="pin-chip" onClick={() => setPicked(m.key)}>
            {m.name}{m.gpio !== undefined ? ` · GPIO${m.gpio}` : ''}
          </button>
        ))}
      </div>

      <div className="pin-result" aria-live="polite">
        {!q && <p className="pin-result-empty">Type a pin, or tap one of the examples, to see everything about it.</p>}
        {q && !result && suggestions.length === 0 && (
          <p className="pin-result-empty">No pin called “{query}”. Try a name printed on the board, like IO0, Tx or SCL.</p>
        )}
        {result && (
          <article className="pin-card">
            <header>
              <div>
                <span className="pin-card-where">{result.where}</span>
                <h3>{result.name}</h3>
              </div>
              {result.safety ? (
                <span className={`badge badge-${result.safety.safety}`}>{SAFETY_LABEL[result.safety.safety]}</span>
              ) : (
                <span className="badge badge-reserved">Power</span>
              )}
            </header>
            <dl className="pin-card-facts">
              {result.gpio !== undefined && <div><dt>GPIO</dt><dd>{result.gpio}</dd></div>}
              {result.safety && result.safety.gpio && result.gpio === undefined && <div><dt>GPIO</dt><dd>{result.safety.gpio}</dd></div>}
              {result.detail && <div><dt>What it is</dt><dd>{result.detail}</dd></div>}
              {result.adc !== undefined && <div><dt>Analog input</dt><dd>{result.adc || 'No'}</dd></div>}
              {result.touch !== undefined && <div><dt>Touch</dt><dd>{result.touch || 'No'}</dd></div>}
              {result.safety && <div><dt>Use it for</dt><dd>{result.safety.useFor}</dd></div>}
              {result.sketch && <div><dt>Name in your sketch</dt><dd><code>{result.sketch}</code></dd></div>}
            </dl>
            {result.safety && <p className="pin-card-note"><b>Good to know</b>{result.safety.note}</p>}
            {!result.safety && (
              <p className="pin-card-note"><b>Good to know</b>Power pin, not a GPIO. Check the power rules below before you connect anything.</p>
            )}
          </article>
        )}
      </div>

      <dialog
        ref={dialogRef}
        className="pin-dialog"
        aria-label="Full pin tables"
        onClick={(e) => {
          if (e.target === dialogRef.current) closeTable(); // click on the dark backdrop
        }}
      >
        <div className="pin-dialog-inner">
          <div className="pin-dialog-head">
            <h3>All pins</h3>
            <button type="button" className="button button-dark" onClick={closeTable}>
              Hide table <span>✕</span>
            </button>
          </div>
          <p className="docs-lead">
            <b>Safe</b>: use freely. <b>Caution</b>: shared or has a catch, read the note. <b>Reserved</b>: wired to
            something on the board, not on the header.
          </p>
          <div className="docs-table-wrap">
            <table className="docs-table">
              <thead>
                <tr><th>Pin</th><th>GPIO</th><th>Status</th><th>Use it for</th><th>Notes</th></tr>
              </thead>
              <tbody>
                {PIN_SAFETY.map((p) => (
                  <tr key={p.pin}>
                    <td data-label="Pin"><b>{p.pin}</b><code>{p.sketch}</code></td>
                    <td data-label="GPIO">{p.gpio}</td>
                    <td data-label="Status"><span className={`badge badge-${p.safety}`}>{SAFETY_LABEL[p.safety]}</span></td>
                    <td data-label="Use it for">{p.useFor}</td>
                    <td data-label="Notes">{p.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h4 className="docs-sub">What each pin can do</h4>
          <p className="docs-lead docs-lead-tight">
            Every digital pin can also be PWM, UART, SPI, I2C or I2S, because the ESP32-S3 lets you route them freely.
            Analog input and touch are the only things tied to specific pins.
          </p>
          <div className="docs-table-wrap">
            <table className="docs-table docs-table-caps">
              <thead>
                <tr><th>Header pin</th><th>GPIO</th><th>Analog input</th><th>Touch</th></tr>
              </thead>
              <tbody>
                {PIN_CAPS.map((c) => (
                  <tr key={c.pin + c.gpio}>
                    <td data-label="Header pin"><b>{c.pin}</b></td>
                    <td data-label="GPIO">{c.gpio}</td>
                    <td data-label="Analog input">{c.adc || <span className="dash">–</span>}</td>
                    <td data-label="Touch">{c.touch || <span className="dash">–</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </dialog>
    </div>
  );
}
