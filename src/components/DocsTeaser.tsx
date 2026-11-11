'use client';

import Link from 'next/link';
import { CONTACT_EMAIL, SCHEMATIC_PDF } from '../lib/elyssa-docs';

export default function DocsTeaser() {
  return (
    <section className="docs-teaser" id="tech-docs">
      <div className="section-wrap">
        <div className="section-label reveal">
          <span>Technical</span>
          <span>Docs &amp; downloads</span>
        </div>
        <div className="docs-teaser-grid">
          <div className="reveal">
            <h2>
              Going deeper?<br />
              <em>Read the technical docs.</em>
            </h2>
            <p>
              The full schematic, the pinout, a table of which pins are safe for what, and the power regulation with
              safe operating ranges. All in one place.
            </p>
            <div className="docs-teaser-actions">
              <Link href="/docs" className="button button-acid">Open technical docs</Link>
              <a className="button button-dark" href={SCHEMATIC_PDF} download="elyssa-schematic.pdf">
                Download schematic (PDF) <span>↓</span>
              </a>
            </div>
          </div>
          <ul className="docs-teaser-list reveal delay-one">
            <li><Link href="/docs#pinout"><small>01</small>Pinout of header J12<b>→</b></Link></li>
            <li><Link href="/docs#pin-safety"><small>02</small>Which pin is safe for what<b>→</b></Link></li>
            <li><Link href="/docs#power"><small>03</small>Power regulation &amp; safe ranges<b>→</b></Link></li>
            <li>
              <a href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('[Elyssa] Question')}`}>
                <small>04</small>Ask us a question by email<b>↗</b>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
