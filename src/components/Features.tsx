'use client';

import React from 'react';

export default function Features() {
  return (
    <section className="intro section-wrap" id="inside">
      <div className="section-label reveal">
        <span>01</span>
        <span>The idea</span>
      </div>
      <div className="intro-grid">
        <h2 className="reveal">Everything you need<br />to make it <em>real.</em></h2>
        <div className="intro-copy reveal delay-one">
          <p>
            Wireless, motion-aware and ready for the Arduino IDE. Elyssa keeps the useful stuff close, so your attention can stay on the thing you're making.
          </p>
          <a
            className="text-link"
            href="https://github.com/moovma/Elyssa-dev-board#features"
            target="_blank"
            rel="noreferrer"
          >
            Explore the full feature list <span>↗</span>
          </a>
        </div>
      </div>
      <div className="feature-grid">
        <article className="feature-card feature-card-wide reveal">
          <div className="feature-card-top">
            <span className="card-index">A / 01</span>
            <span className="card-icon">✳</span>
          </div>
          <h3>Feel the world<br />around it.</h3>
          <p>LSM6DS3TR-C accelerometer, gyroscope and temperature sensor on a dedicated I2C bus.</p>
          <span className="card-arrow">↗</span>
        </article>
        <article className="feature-card feature-card-olive reveal delay-one">
          <div className="feature-card-top">
            <span className="card-index">B / 02</span>
            <span className="card-icon">⌁</span>
          </div>
          <h3>Connected<br />by default.</h3>
          <p>ESP32-S3 dual-core power with Wi-Fi and Bluetooth LE 5 built into the board.</p>
          <span className="card-arrow">↗</span>
        </article>
        <article className="feature-card feature-card-outline reveal delay-two">
          <div className="feature-card-top">
            <span className="card-index">C / 03</span>
            <span className="card-icon">●</span>
          </div>
          <h3>Room to<br />go further.</h3>
          <p>microSD, Qwiic, LiPo charging, native USB-C and a generous maker-friendly header.</p>
          <span className="card-arrow">↗</span>
        </article>
      </div>
    </section>
  );
}
