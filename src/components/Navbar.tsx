'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="section-wrap site-header-inner">
        <Link href="/" className="brand-link" aria-label="Moovma home">
          <img
            src="/PNG/Moovma Black@2x.png"
            alt="Moovma"
            className="brand-logo-img"
          />
          <span className="brand-badge">ELYSSA / V3</span>
        </Link>

        <nav className="main-nav" aria-label="Main navigation">
          <a href="#inside">Inside</a>
          <a href="#anatomy">3D Anatomy</a>
          <a href="#specs">Specs</a>
          <a href="#quickstart">Quick Start</a>
          <a href="#documentation">Docs</a>
        </nav>

        <div className="header-actions">
          <a
            className="text-link"
            href="https://github.com/moovma/Elyssa-dev-board"
            target="_blank"
            rel="noreferrer"
            style={{ marginRight: 6 }}
          >
            GitHub
          </a>

          <Link href="/preorder" className="button button-acid">
            Pre-order
          </Link>

          <button
            type="button"
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            <span style={{ fontSize: 22, lineHeight: 1 }}>☰</span>
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="mobile-menu-drawer">
          <a
            href="#inside"
            onClick={() => setMobileMenuOpen(false)}
            className="mobile-nav-link"
          >
            Inside
          </a>
          <a
            href="#anatomy"
            onClick={() => setMobileMenuOpen(false)}
            className="mobile-nav-link"
          >
            3D Anatomy
          </a>
          <a
            href="#specs"
            onClick={() => setMobileMenuOpen(false)}
            className="mobile-nav-link"
          >
            Specs
          </a>
          <a
            href="#quickstart"
            onClick={() => setMobileMenuOpen(false)}
            className="mobile-nav-link"
          >
            Quick Start
          </a>
          <a
            href="#documentation"
            onClick={() => setMobileMenuOpen(false)}
            className="mobile-nav-link"
          >
            Documentation
          </a>
          <div style={{ paddingTop: 8 }}>
            <Link
              href="/preorder"
              className="button button-acid"
              style={{ width: '100%', textAlign: 'center' }}
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
