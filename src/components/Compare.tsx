import React from 'react';

/**
 * Elyssa vs. two popular boards. Elyssa facts come from the schematic / src/lib/elyssa-docs.ts.
 * The other two columns use the public specs of the official Espressif ESP32-S3-DevKitC-1 and the Arduino Uno R3.
 * `null` = not on the board (shown as a dash).
 */
type Cell = string | null;
interface Row { name: string; elyssa: Cell; devkit: Cell; uno: Cell }

const BOARDS = [
  { key: 'elyssa', name: 'Elyssa' },
  { key: 'devkit', name: 'ESP32-S3 DevKit' },
  { key: 'uno', name: 'Arduino Uno R3' },
] as const;

const ROWS: Row[] = [
  { name: 'Brain', elyssa: 'ESP32-S3, dual-core 240 MHz', devkit: 'ESP32-S3, dual-core 240 MHz', uno: 'ATmega328P, 8-bit 16 MHz' },
  { name: 'Memory', elyssa: '8 MB flash', devkit: '8 – 32 MB flash, PSRAM on some versions', uno: '32 KB flash, 2 KB RAM' },
  { name: 'Wireless', elyssa: 'Wi-Fi 2.4 GHz + BLE 5', devkit: 'Wi-Fi 2.4 GHz + BLE 5', uno: null },
  { name: 'Motion sensor', elyssa: '6-axis IMU built in', devkit: null, uno: null },
  { name: 'Battery', elyssa: 'LiPo charger built in', devkit: null, uno: null },
  { name: 'microSD', elyssa: 'Slot on the back', devkit: null, uno: null },
  { name: 'Qwiic (plug-in sensors)', elyssa: 'Yes', devkit: null, uno: null },
  { name: 'Built-in light', elyssa: 'RGB LED + status LEDs', devkit: 'Addressable RGB LED', uno: 'One LED + status LEDs' },
  { name: 'Pins', elyssa: '22-pin header + Qwiic', devkit: '2 × 22-pin headers', uno: '14 digital + 6 analog' },
  { name: 'Analog inputs', elyssa: '12-bit', devkit: '12-bit', uno: '10-bit' },
  { name: 'Touch pins', elyssa: '10', devkit: 'Yes', uno: null },
  { name: 'Logic level', elyssa: '3.3 V', devkit: '3.3 V', uno: '5 V' },
  { name: 'Arduino IDE', elyssa: 'Yes, with LED and motion helpers', devkit: 'Yes', uno: 'Yes' },
];

const PICKS = [
  { board: 'Arduino Uno R3', text: 'Great for 5 V classics and a first blink. No wireless.' },
  { board: 'ESP32-S3 DevKit', text: 'The most pins and memory options. Sensors, battery and storage are up to you.' },
  { board: 'Elyssa', text: 'Wireless, motion, battery and microSD already on the board. Plug in and build.' },
];

function Value({ v }: { v: Cell }) {
  if (v === null) return <span className="cmp-no" aria-label="Not on the board">—</span>;
  return <>{v}</>;
}

export default function Compare() {
  return (
    <section className="compare-section" id="compare">
      <div className="section-wrap">
        <div className="section-label reveal">
          <span>03</span>
          <span>How it compares</span>
        </div>
        <div className="spec-heading compare-heading">
          <h2 className="reveal">Same power.<br /><em>More on board.</em></h2>
          <p className="reveal delay-one">
            Elyssa runs on the same ESP32-S3 chip as Espressif’s DevKit, and the same Arduino IDE as the Uno. The
            difference is what’s already on the board, so you wire less and build more.
          </p>
        </div>

        <div className="cmp-wrap reveal delay-two">
          <table className="cmp-table">
            <caption className="sr-only">Elyssa compared with the ESP32-S3 DevKit and the Arduino Uno R3</caption>
            <thead>
              <tr>
                <th scope="col"><span className="sr-only">Feature</span></th>
                {BOARDS.map((b) => (
                  <th key={b.key} scope="col" className={b.key === 'elyssa' ? 'cmp-elyssa' : undefined}>{b.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r) => (
                <tr key={r.name}>
                  <th scope="row">{r.name}</th>
                  {BOARDS.map((b) => (
                    <td key={b.key} data-label={b.name} className={b.key === 'elyssa' ? 'cmp-elyssa' : undefined}>
                      <Value v={r[b.key]} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ul className="cmp-picks reveal">
          {PICKS.map((p) => (
            <li key={p.board} className={p.board === 'Elyssa' ? 'is-elyssa' : undefined}>
              <span className="cmp-pick-label">Pick {p.board}</span>
              <p>{p.text}</p>
            </li>
          ))}
        </ul>

        <p className="cmp-note">
          Based on the public specs of the official Espressif ESP32-S3-DevKitC-1 and the Arduino Uno R3. Other versions
          and clones can differ. Full Elyssa details are in the <a href="/docs">docs</a>.
        </p>
      </div>
    </section>
  );
}
