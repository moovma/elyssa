'use client';

import React from 'react';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="section-wrap footer-inner">
        {/* Centered Moovma logo with copyright logo (c in circle) right next to it */}
        <div className="footer-center-brand">
          <span className="footer-copyright-logo" title="Copyright">
            ©
          </span>
          <img
            src="/PNG/Moovma White@2x.png"
            alt="Moovma Logo"
            className="footer-moovma-logo"
          />
          <span className="footer-brand-title">ELYSSA / DEV BOARD</span>
        </div>

        {/* Footer Navigation Links */}
        <nav className="footer-nav-links" aria-label="Footer Navigation">
          <a href="#top">Back to Top ↑</a>
          <a href="#inside">Inside</a>
          <a href="#anatomy">3D Anatomy</a>
          <a href="#specs">Specs</a>
          <a href="#quickstart">Quick Start</a>
          <a
            href="https://github.com/moovma/Elyssa-dev-board"
            target="_blank"
            rel="noreferrer"
          >
            GitHub Repository ↗
          </a>
          <a
            href="https://raw.githubusercontent.com/yassinechouk/Elyssa-dev-board/main/elyssa-arduino/package_moovma_elyssa_index.json"
            target="_blank"
            rel="noreferrer"
          >
            Arduino Package ↗
          </a>
        </nav>

        {/* Bottom copyright notice */}
        <div className="footer-bottom-copy">
          <span>Open Hardware from Tunisia</span>
          <span>·</span>
          <span>© 2026 MOOVMA. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
