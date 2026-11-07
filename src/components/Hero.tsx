'use client';

import React from 'react';
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="hero section-wrap" id="top">
      <div className="hero-gallery reveal">
        <div className="hero-photo hero-photo-front">
          <img
            src="/elyssa_images/elyssa_top.png"
            alt="Elyssa development board, front side"
            loading="eager"
            decoding="async"
          />
        </div>
        <div className="hero-photo hero-photo-back">
          <img
            src="/elyssa_images/elyssa_buttom.png"
            alt="Elyssa development board, back side"
            loading="eager"
            decoding="async"
          />
        </div>
      </div>
      <div className="hero-copy reveal delay-one">
        <p className="eyebrow">Moovma presents</p>
        <h1>Elyssa is a dev board<br />for <em>building things.</em></h1>
        <p className="hero-intro">
          An ESP32-S3 board with motion sensing, wireless connectivity, and a documentation-first workflow for curious makers.
        </p>
        <div className="hero-actions">
          <Link className="button button-acid" href="/preorder">
            Pre-order Elyssa
          </Link>
          <a
            className="button button-dark"
            href="https://github.com/moovma/Elyssa-dev-board#readme"
            target="_blank"
            rel="noreferrer"
          >
            Read the docs <span>↗</span>
          </a>
          <a className="text-link" href="#inside">
            Scroll to explore <span>↓</span>
          </a>
        </div>
      </div>
    </section>
  );
}
