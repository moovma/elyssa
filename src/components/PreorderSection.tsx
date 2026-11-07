'use client';

import React from 'react';
import Link from 'next/link';

export default function PreorderSection() {
  return (
    <section className="preorder-section" id="preorder">
      <div className="section-wrap">
        <div className="section-label reveal">
          <span>04</span>
          <span>Pre-order</span>
        </div>
        <div className="preorder-banner-grid">
          <div className="preorder-banner-copy reveal">
            <h2>Ready to make<br /><em>the next thing?</em></h2>
            <p>
              Pre-order your Elyssa development board now and be part of the first production batch from Tunisia.
            </p>
            <ul className="preorder-features-list">
              <li>1x Elyssa ESP32-S3FN8 development board (tested and verified)</li>
              <li>2x 14-pin breadboard headers</li>
              <li>Official ElyssaIMU library and Arduino BSP access</li>
              <li>Full KiCad v3 schematics and hardware documentation</li>
            </ul>
            <Link href="/preorder" className="button button-acid">
              Pre-order Elyssa
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
              <span><small>03</small>See what's new</span>
              <b>↗</b>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
