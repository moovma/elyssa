'use client';

import React from 'react';
import Link from 'next/link';
import Gfx from './Gfx';

export default function Hero() {
  return (
    <section className="hero" id="top">
      <Gfx shape="gem" color="g2" size={200} right={90} bottom={64} />
      <div className="hero-logo-wrap reveal">
        <img
          src="/graphics/logo2.svg"
          alt="Elyssa logo"
          className="hero-logo-img"
        />
      </div>
      <div className="hero-copy section-wrap reveal delay-one">
        <p className="eyebrow">Moovma presents · Proudly Tunisian</p>
        <h1>The first Tunisian<br /><em>dev board.</em></h1>
        <p className="hero-intro">
          Meet Elyssa. Wi-Fi, Bluetooth, motion sensing and battery charging on one tiny board, designed in Tunisia for the makers, students and engineers who will build what comes next. Plug it in, upload a sketch, and make something real today.</p>
        <div className="hero-actions">
          <Link className="button button-acid" href="/preorder">
            Reserve your Elyssa
          </Link>
          <a
            className="button button-dark"
            href="https://github.com/moovma/Elyssa-dev-board#readme"
            target="_blank"
            rel="noreferrer"
          >
            Explore the docs <span>↗</span>
          </a>
          <a className="text-link" href="#inside">
            See what it can do <span>↓</span>
          </a>
        </div>
        <ul className="hero-proof" aria-label="Why Elyssa">
          <li>Open source</li>
          <li>Arduino ready</li>
          <li>USB-C</li>
          <li>Wi-Fi + Bluetooth 5</li>
        </ul>
      </div>
    </section>
  );
}
