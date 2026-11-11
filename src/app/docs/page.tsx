import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ContactForm from '../../components/ContactForm';
import PinTableDownload from '../../components/PinTableDownload';
import Gfx, { CONTENT_RIGHT } from '../../components/Gfx';
import {
  BOARD_BOTTOM_IMG,
  BOARD_TOP_IMG,
  CONTACT_EMAIL,
  HEADER_PINS,
  NOT_TESTED,
  PIN_SAFETY,
  POWER_ROWS,
  REPO_LINKS,
  SCHEMATIC_PDF,
} from '../../lib/elyssa-docs';

export const metadata: Metadata = {
  title: 'Elyssa technical docs: schematic, pinout, pin safety, power',
  description:
    'Download the Elyssa schematic (PDF), the pinout, and check which pins are safe to use, plus power regulation and safe operating ranges.',
};

const SAFETY_LABEL = { safe: 'Safe', caution: 'Caution', reserved: 'Reserved' } as const;
const SOURCE_LABEL = { repo: 'Repo', chip: 'ESP32-S3 datasheet', schematic: 'Schematic' } as const;

export default function DocsPage() {
  return (
    <main className="docs-page">
      <Navbar />

      {/* white */}
      <header className="docs-hero section-wrap">
      <Gfx shape="clover" color="g2" size={150} right={0} top={36} spin />
        <p className="eyebrow">Technical documentation · Elyssa</p>
        <h1>
          Everything you need<br />
          to <em>wire it up.</em>
        </h1>
        <p className="hero-intro">
          Do not guess, check. The schematic, the pinout, which pins are safe for what, and the power limits, straight from the board files and the open-source repository. Built to save you hours (and a few chips).
        </p>
        <nav className="docs-jump" aria-label="On this page">
          <a href="#downloads">Downloads</a>
          <a href="#pinout">Pinout</a>
          <a href="#pin-safety">Pin safety</a>
          <a href="#power">Power &amp; ranges</a>
          <a href="#contact">Ask a question</a>
        </nav>
      </header>

      {/* white */}
      <section className="docs-band" id="downloads">
        <div className="section-wrap">
          <div className="section-label"><span>01</span><span>Downloads</span></div>
          <div className="docs-dl-grid">
            <a className="docs-dl-card docs-dl-acid" href={SCHEMATIC_PDF} download="elyssa-schematic.pdf">
              <small>PDF</small>
              <strong>Elyssa schematic</strong>
              <span>Full circuit: power, charger, ESP32-S3, IMU, microSD</span>
              <b>↓</b>
            </a>
            <a className="docs-dl-card" href={BOARD_TOP_IMG} download="elyssa-pinout-top.png">
              <small>PNG</small>
              <strong>Pinout: top side</strong>
              <span>Header labels, USB-C, RGB LED, buttons</span>
              <b>↓</b>
            </a>
            <a className="docs-dl-card" href={BOARD_BOTTOM_IMG} download="elyssa-pinout-bottom.png">
              <small>PNG</small>
              <strong>Pinout: back side</strong>
              <span>Mirrored header labels and the microSD socket</span>
              <b>↓</b>
            </a>
            <PinTableDownload />
          </div>
        </div>
      </section>

      {/* black */}
      <section className="docs-band docs-dark" id="pinout">
        <div className="section-wrap">
          <div className="section-label"><span>02</span><span>Pinout</span></div>
          <h2>Header J12, <em>top to bottom.</em></h2>
          <p className="docs-lead">
            Names follow the silkscreen and work in sketches without any <code>#include</code>. IO0 to IO6 are GPIO1 to
            GPIO7. There is no A7 and no T7.
          </p>
          <div className="pinout-layout">
            <div className="pinout-board">
              <img src={BOARD_TOP_IMG} alt="Elyssa board, top view, with header labels" />
            </div>
            <div>
              <ol className="pin-chart" aria-label="Header pin list">
                {HEADER_PINS.map((p) => (
                  <li key={p.n} className={`pin-row pin-${p.kind}`}>
                    <span className="pin-n">{String(p.n).padStart(2, '0')}</span>
                    <b className="pin-label">{p.label}</b>
                    <span className="pin-gpio">{p.gpio !== undefined ? `GPIO${p.gpio}` : '—'}</span>
                    <span className="pin-detail">{p.detail}</span>
                  </li>
                ))}
              </ol>
              <ul className="pin-legend">
                <li className="lg-power">Power / ground</li>
                <li className="lg-gpio">Analog · touch · digital</li>
                <li className="lg-comm">UART · SPI · I2C</li>
                <li className="lg-pwm">PWM</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* white */}
      <section className="docs-band" id="pin-safety">
        <div className="section-wrap">
          <div className="section-label"><span>03</span><span>Which pin is safe for what</span></div>
          <h2>Pin <em>safety table.</em></h2>
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
        </div>
      </section>

      {/* black */}
      <section className="docs-band docs-dark" id="power">
        <div className="section-wrap">
          <div className="section-label"><span>04</span><span>Power &amp; safe ranges</span></div>
          <h2>Power, regulation <em>and limits.</em></h2>
          <p className="docs-lead">Values from the repository and the ESP32-S3 datasheet. Check the schematic for the rest.</p>
          <div className="docs-table-wrap">
            <table className="docs-table">
              <thead>
                <tr><th>Item</th><th>Value</th><th>Notes</th><th>Source</th></tr>
              </thead>
              <tbody>
                {POWER_ROWS.map((r) => (
                  <tr key={r.item}>
                    <td data-label="Item"><b>{r.item}</b></td>
                    <td data-label="Value">{r.value}</td>
                    <td data-label="Notes">{r.note}</td>
                    <td data-label="Source"><span className="source-tag">{SOURCE_LABEL[r.source]}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="docs-callout">
            <span>Not tested on a board yet</span>
            <p>{NOT_TESTED.join(' · ')}.</p>
          </div>
        </div>
      </section>

      {/* white: go deeper + contact */}
      <section className="docs-band" id="contact">
        <div className="section-wrap">
          <div className="docs-cta-grid">
            <div>
              <div className="section-label"><span>05</span><span>Questions &amp; pre-order</span></div>
              <h2>Still have <em>a question?</em></h2>
              <p className="docs-lead">
                Ask about pins, power or the pre-order. Your mail app opens with the message ready to send to{' '}
                <a className="text-link" href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
              </p>
              <Link href="/preorder" className="button button-acid">Pre-order Elyssa</Link>
              <div className="start-links docs-links">
                {REPO_LINKS.map((l, i) => (
                  <a key={l.href} href={l.href} target="_blank" rel="noreferrer">
                    <span><small>{String(i + 1).padStart(2, '0')}</small>{l.label}</span>
                    <b>↗</b>
                  </a>
                ))}
              </div>
            </div>
            <ContactForm />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
