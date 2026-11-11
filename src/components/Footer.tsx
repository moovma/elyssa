'use client';

import React from 'react';
import SocialIcon from './SocialIcon';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner section-wrap">
        <div className="footer-row">
          <div className="footer-side footer-left">
            <span>Made in Tunisia, open to the world · <a href="/shop">Shop</a></span>
          </div>
          <div className="footer-brand">
            <img src="/PNG/Moovma White@2x.png" alt="Moovma" />
            <div className="footer-copyright">
              <span className="copyright-symbol">&copy;</span> ALL RIGHTS RESERVED BY MOOVMA 2027
            </div>
          </div>
          <div className="footer-side footer-right">
            <a href="https://github.com/moovma" target="_blank" rel="noreferrer"><SocialIcon id="github" size={13} />GitHub</a>
            <a href="https://www.instagram.com/moovm_a/" target="_blank" rel="noreferrer"><SocialIcon id="instagram" size={13} />Instagram</a>
            <a href="https://www.youtube.com/@Moovma" target="_blank" rel="noreferrer"><SocialIcon id="youtube" size={13} />YouTube</a>
            <a href="https://www.linkedin.com/company/136294093/" target="_blank" rel="noreferrer"><SocialIcon id="linkedin" size={13} />LinkedIn</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
