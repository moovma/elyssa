'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <Link href="/" className="brand" aria-label="Moovma home">
        <img src="/PNG/Moovma Black@2x.png" alt="Moovma" />
      </Link>

      <nav className="main-nav" aria-label="Main navigation">
        <a href="#inside">Inside</a>
        <a href="#anatomy">3D Anatomy</a>
        <a href="#specs">Specs</a>
        <a href="#quickstart">Quick Start</a>
        <a href="#start">Docs</a>
      </nav>

      <div className="header-actions">
        <a
          className="text-link"
          href="https://github.com/moovma/Elyssa-dev-board"
          target="_blank"
          rel="noreferrer"
        >
          GitHub <span>↗</span>
        </a>

        <Link href="/preorder" className="button button-acid">
          Pre-order
        </Link>

        <button
          type="button"
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          ☰
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="mobile-menu-drawer">
          <a href="#inside" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">Inside</a>
          <a href="#anatomy" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">3D Anatomy</a>
          <a href="#specs" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">Specs</a>
          <a href="#quickstart" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">Quick Start</a>
          <a href="#start" onClick={() => setMobileMenuOpen(false)} className="mobile-nav-link">Docs</a>
          <div style={{ paddingTop: 8 }}>
            <Link
              href="/preorder"
              className="button button-acid"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => setMobileMenuOpen(false)}
            >
              Pre-order Elyssa
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
