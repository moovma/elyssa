'use client';

import React from 'react';
import Link from 'next/link';

export default function PreorderSection() {
  return (
    <section className="preorder-section" id="preorder">
      <div className="section-wrap">
        <div className="preorder-banner-card">
          <div>
            <span className="mono-tag" style={{ color: 'var(--acid)', marginBottom: 12, display: 'inline-block' }}>
              Production Batch 01 · Limited Early Allocation
            </span>
            <h2>
              Ready to make<br />
              <em>the next thing?</em>
            </h2>
            <p>
              Pre-order your Elyssa development board now and receive priority production access,
              open hardware schematics, firmware libraries, and direct community support.
            </p>
            <ul className="preorder-features-list">
              <li>1x Elyssa ESP32-S3FN8 development board (tested and verified)</li>
              <li>2x 14-pin breadboard headers</li>
              <li>Official ElyssaIMU library & Arduino BSP access</li>
              <li>Full KiCad v3 schematics and hardware documentation</li>
            </ul>
          </div>

          <div className="preorder-action-box">
            <span className="preorder-badge">Early Batch Reservation</span>
            <div className="preorder-subtext" style={{ fontSize: 13, color: '#a1a1aa', margin: '14px 0 20px' }}>
              Reserve your board from the first Tunisian production run.
            </div>
            <Link
              href="/preorder"
              className="button button-acid"
              style={{ width: '100%', padding: '15px 24px', fontSize: 12, textAlign: 'center' }}
            >
              Pre-order Elyssa
            </Link>
            <span style={{ fontSize: 11, color: '#71717a', marginTop: 14, display: 'block' }}>
              No upfront payment required · Reserve your unit now
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
