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
              Want the full picture?<br />
              <em>It is all open.</em>
            </h2>
            <p>
              The complete schematic, a pinout you can trust, which pins are safe for what, and the power limits. Nothing about your board is a guess, and nothing is hidden.
            </p>
            <div className="docs-teaser-actions">
              <Link href="/docs" className="button button-acid">Open the technical docs</Link>
              <a className="button button-dark" href={SCHEMATIC_PDF} download="elyssa-schematic.pdf">
                Download schematic (PDF) <span>↓</span>
              </a>
            </div>
          </div>
          <ul className="docs-teaser-list reveal delay-one">
            <li><Link href="/docs#pinout"><small>01</small>See every pin on the header<b>→</b></Link></li>
            <li><Link href="/docs#pin-safety"><small>02</small>Find out which pin is safe for what<b>→</b></Link></li>
            <li><Link href="/docs#power"><small>03</small>Check the power and safe ranges<b>→</b></Link></li>
            <li>
              <a href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('[Elyssa] Question')}`}>
                <small>04</small>Still stuck? Ask us by email<b>↗</b>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
