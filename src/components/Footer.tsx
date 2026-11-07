'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner section-wrap">
        {/* Left side: Contact, GitHub, Copyright */}
        <div className="footer-left">
          <Link href="/contact" className="text-link" aria-label="Contact us">
            Contact Us
          </Link>
          <span className="footer-copyright">© 2026 Moovma</span>
          <Link
            href="https://github.com/moovma/Elyssa-dev-board"
            target="_blank"
            rel="noreferrer"
            className="text-link"
          >
            GitHub ↗
          </Link>
        </div>
        {/* Center: Moovma logo centered in a black ribbon */}
        <div className="footer-black-ribbon">
          <img
            src="/PNG/Moovma White@2x.png"
            alt="Moovma"
            className="footer-logo-img"
          />
          <span className="footer-brand-text">ELYSSA / DEV BOARD</span>
        </div>
      </div>
    </footer>
  );
}
