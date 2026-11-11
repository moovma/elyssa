'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

type Variant = 'elyssa' | 'moovma';

const LINKS: Record<Variant, { href: string; label: string; internal?: boolean }[]> = {
  elyssa: [
    { href: '/elyssa#inside', label: 'Inside' },
    { href: '/elyssa#anatomy', label: '3D Anatomy' },
    { href: '/elyssa#specs', label: 'Specs' },
    { href: '/elyssa#quickstart', label: 'Quick Start' },
    { href: '/docs', label: 'Tech docs', internal: true },
  ],
  moovma: [
    { href: '/#about', label: 'About' },
    { href: '/#services', label: 'Services' },
    { href: '/#products', label: 'Products' },
    { href: '/#work', label: 'Our work' },
    { href: '/#contact', label: 'Contact' },
  ],
};

function ShopIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 8h14l-1.2 11.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8L5 8Z" />
      <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
    </svg>
  );
}

export default function Navbar({ variant = 'elyssa' }: { variant?: Variant }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const links = LINKS[variant];
  const close = () => setMobileMenuOpen(false);

  // close the menu with Escape or when the screen becomes wide again
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMobileMenuOpen(false);
    const mq = window.matchMedia('(min-width: 961px)');
    const onMq = () => mq.matches && setMobileMenuOpen(false);
    window.addEventListener('keydown', onKey);
    mq.addEventListener('change', onMq);
    return () => {
      window.removeEventListener('keydown', onKey);
      mq.removeEventListener('change', onMq);
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`site-header${scrolled ? ' is-scrolled' : ''}`}>
      <Link href="/" className="brand" aria-label="Moovma home">
        <img src="/PNG/Moovma Black@2x.png" alt="Moovma" />
      </Link>

      <nav className="main-nav" aria-label="Main navigation">
        {links.map((l) =>
          l.internal ? (
            <Link key={l.href} href={l.href}>{l.label}</Link>
          ) : (
            <a key={l.href} href={l.href}>{l.label}</a>
          )
        )}
      </nav>

      <div className="header-actions">
        <Link href="/shop" className="shop-link" aria-label="Shop">
          <ShopIcon />
          <span>Shop</span>
        </Link>

        {variant === 'moovma' ? (
          <Link href="/elyssa" className="button button-acid">Meet Elyssa</Link>
        ) : (
          <Link href="/preorder" className="button button-acid">Pre-order</Link>
        )}

        <button
          type="button"
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="mobile-menu-drawer">
          {links.map((l) =>
            l.internal ? (
              <Link key={l.href} href={l.href} onClick={close} className="mobile-nav-link">{l.label}</Link>
            ) : (
              <a key={l.href} href={l.href} onClick={close} className="mobile-nav-link">{l.label}</a>
            )
          )}
          <Link href="/shop" onClick={close} className="mobile-nav-link">Shop</Link>
          <div style={{ paddingTop: 8 }}>
            <Link
              href={variant === 'moovma' ? '/elyssa' : '/preorder'}
              className="button button-acid"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={close}
            >
              {variant === 'moovma' ? 'Meet Elyssa' : 'Pre-order Elyssa'}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
