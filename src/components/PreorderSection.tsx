'use client';

import React from 'react';
import Link from 'next/link';
import { CONTACT_EMAIL } from '../lib/elyssa-docs';
import JsonLd from './JsonLd';

const FAQ = [
  {
    q: 'Do I need experience?',
    a: 'No. If you can use Arduino, you can use Elyssa. The quick start above takes you from the box to a blinking LED in four steps, and if you get stuck you can email us.',
  },
  {
    q: 'Which software does it use?',
    a: 'The free Arduino IDE 2 with the Moovma board package. The basics, like the RGB LED and the motion sensor, are built in, so you do not need extra libraries to get started.',
  },
  {
    q: 'Is Elyssa open source?',
    a: 'Yes. The code, the board package and the documentation are public on GitHub under the MIT license, and you can download the schematic for free.',
  },
  {
    q: 'Can I power Elyssa with 12 V?',
    a: 'Not directly: 12 V would damage it. Vin and USB-C are 5 V inputs, and the 3.3 V regulator on the board accepts at most 5.5 V. To use a 12 V supply, add a 12 V to 5 V step-down (buck) module and connect its output to Vin and Gnd, with USB unplugged. A 5 V USB-C charger or a single 3.7 V LiPo cell also work.',
  },
  {
    q: 'How does pre-ordering work?',
    a: 'Fill in the short form and choose how many boards you want. You pay nothing now: we contact you before any charge to confirm your order.',
  },
  {
    q: 'What does it cost?',
    a: 'You will see the official price as soon as you reserve your board. Nothing is charged until we have spoken to you.',
  },
];

/** The same questions as schema.org FAQPage data, so Google and AI assistants can quote the answers. */
const FAQ_DATA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
};

export default function PreorderSection() {
  return (
    <section className="preorder-section" id="preorder">
      <JsonLd data={FAQ_DATA} />
      <div className="section-wrap">
        <div className="section-label reveal">
          <span>04</span>
          <span>Pre-order</span>
        </div>
        <div className="preorder-banner-grid">
          <div className="preorder-banner-copy reveal">
            <h2>Be among the first<br />to build with <em>Elyssa.</em></h2>
            <p>
              The first production batch is being prepared. Reserve your board today, with no payment now.
              We will contact you before any charge. The future is built by people who start early.
            </p>
            <ul className="preorder-features-list">
              <li>1× Elyssa ESP32-S3FN8 dev board, tested and verified</li>
              <li>2× 14-pin breadboard headers</li>
              <li>The official ElyssaIMU library and Arduino board package</li>
              <li>Full schematics and hardware documentation</li>
            </ul>
            <Link href="/preorder" className="button button-acid">
              Reserve your Elyssa
            </Link>
          </div>
          <div className="start-links reveal delay-one">
            <a href="https://github.com/moovma/Elyssa-dev-board/blob/main/README.md" target="_blank" rel="noreferrer">
              <span><small>01</small>Read the README</span>
              <b>↗</b>
            </a>
            <a href="https://github.com/moovma/Elyssa-dev-board/tree/main/platform/libraries/ElyssaIMU" target="_blank" rel="noreferrer">
              <span><small>02</small>Explore ElyssaIMU</span>
              <b>↗</b>
            </a>
            <a href="https://github.com/moovma/Elyssa-dev-board/blob/main/CHANGELOG.md" target="_blank" rel="noreferrer">
              <span><small>03</small>See what is new</span>
              <b>↗</b>
            </a>
          </div>
        </div>

        <div className="faq reveal" id="faq">
          <div className="faq-head">
            <h3>Questions, <em>answered.</em></h3>
            <p>
              Something else on your mind? <a className="text-link" href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('[Elyssa] Question')}`}>Email us</a>.
            </p>
          </div>
          <div className="faq-list">
            {FAQ.map((f) => (
              <details key={f.q} className="faq-item">
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
