'use client';

import React from 'react';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner section-wrap">
        <div className="footer-row">
          <div className="footer-side footer-left"><span>Open hardware from Tunisia</span></div>
          <div className="footer-brand">
            <img src="/PNG/Moovma White@2x.png" alt="Moovma" />
            <span>ELYSSA / DEV BOARD</span>
          </div>
          <div className="footer-side footer-right">
            <a href="https://github.com/moovma/Elyssa-dev-board" target="_blank" rel="noreferrer">GitHub ↗</a>
          </div>
        </div>
        <div className="footer-copyright">
          &copy; All rights reserved by MOOVMA
        </div>
      </div>
    </footer>
  );
}
