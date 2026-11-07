'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function Hero() {
  const [activeSide, setActiveSide] = useState<'front' | 'back'>('front');

  return (
    <section className="hero-section" id="top">
      <div className="section-wrap hero-grid">
        <div className="hero-copy-col">
          <div className="hero-eyebrow">
            <span className="hero-eyebrow-dot"></span>
            <span>Moovma · Hardware for Makers</span>
          </div>

          <h1 className="hero-title">
            Elyssa is a dev board<br />
            for <em>building things.</em>
          </h1>

          <p className="hero-lead">
            An open ESP32-S3 development board with 6-axis motion sensing, wireless connectivity,
            integrated LiPo battery charging, and a documentation-first workflow for makers and engineers.
          </p>

          <div className="hero-actions">
            <Link href="/preorder" className="button button-acid">
              Pre-order Elyssa
            </Link>

            <a
              className="button button-dark"
              href="https://github.com/moovma/Elyssa-dev-board#readme"
              target="_blank"
              rel="noreferrer"
            >
              Read Documentation
            </a>

            <a className="text-link" href="#anatomy">
              Explore 3D Board
            </a>
          </div>
        </div>

        <div className="hero-visual-col">
          <div className="hero-visual-card">
            <div className="hero-visual-header">
              <span className="mono-tag" style={{ color: 'var(--muted)' }}>
                Board Overview · Hardware v3.0
              </span>
              <div className="hero-visual-tabs">
                <button
                  type="button"
                  className={`hero-tab-btn ${activeSide === 'front' ? 'is-active' : ''}`}
                  onClick={() => setActiveSide('front')}
                >
                  Front
                </button>
                <button
                  type="button"
                  className={`hero-tab-btn ${activeSide === 'back' ? 'is-active' : ''}`}
                  onClick={() => setActiveSide('back')}
                >
                  Back
                </button>
              </div>
            </div>

            <div className="hero-image-container">
              {activeSide === 'front' ? (
                <img
                  src="/elyssa_images/elyssa_top.png"
                  alt="Elyssa ESP32-S3 development board front view"
                  className="hero-board-img"
                />
              ) : (
                <img
                  src="/elyssa_images/elyssa_buttom.png"
                  alt="Elyssa development board bottom view with microSD socket"
                  className="hero-board-img"
                />
              )}
            </div>

            <div className="hero-specs-pills">
              <span className="spec-pill">ESP32-S3FN8</span>
              <span className="spec-pill">6-Axis IMU</span>
              <span className="spec-pill">LiPo BMS</span>
              <span className="spec-pill">microSD</span>
              <span className="spec-pill">Qwiic I2C</span>
              <span className="spec-pill">USB-C</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
