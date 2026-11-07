'use client';

import React from 'react';
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero-logo-wrap reveal">
        <img
          src="/graphics/logo2.svg"
          alt="Elyssa logo"
          className="hero-logo-img"
        />
      </div>
      <div className="hero-copy section-wrap reveal delay-one">
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
