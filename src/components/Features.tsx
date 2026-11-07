'use client';

import React from 'react';

export default function Features() {
  return (
    <section className="features-section" id="inside">
      <div className="section-wrap">
        <div className="section-label">
          <span>01</span>
          <span>The Idea & Capabilities</span>
        </div>

        <div className="features-header">
          <h2>
            Everything you need<br />
            to make it <em>real.</em>
          </h2>
          <div>
            <p>
              Wireless, motion-aware, battery-ready, and supported out of the box in the Arduino IDE.
              Elyssa brings core hardware capabilities into a unified footprint so your focus stays on what you are creating.
            </p>
            <div style={{ marginTop: 18 }}>
              <a
                className="text-link"
                href="https://github.com/moovma/Elyssa-dev-board#features"
                target="_blank"
                rel="noreferrer"
              >
                Explore GitHub documentation
              </a>
            </div>
          </div>
        </div>

        <div className="features-grid">
          <article className="feature-card">
            <div className="feature-card-top">
              <span className="feature-card-index mono-tag">A / 01</span>
              <span className="feature-card-label mono-tag">Motion</span>
            </div>
            <div>
              <h3>Feel the world around it.</h3>
              <p className="feature-card-desc">
                Onboard STMicroelectronics LSM6DS3TR-C accelerometer, gyroscope, and temperature sensor
                running on a dedicated I2C bus for gesture control, tilt detection, and robotics.
              </p>
            </div>
            <div className="feature-card-footer">
              <span className="mono-tag" style={{ fontSize: 10, color: 'var(--muted)' }}>I2C Bus · 3.3V</span>
            </div>
          </article>

          <article className="feature-card feature-card-lime">
            <div className="feature-card-top">
              <span className="feature-card-index mono-tag">B / 02</span>
              <span className="feature-card-label mono-tag">Wireless</span>
            </div>
            <div>
              <h3>Connected by default.</h3>
              <p className="feature-card-desc">
                Espressif ESP32-S3 dual-core Xtensa 32-bit LX7 MCU running at 240 MHz with 2.4 GHz Wi-Fi (802.11 b/g/n)
                and Bluetooth 5 (LE) for connected IoT devices and edge computation.
              </p>
            </div>
            <div className="feature-card-footer">
              <span className="mono-tag" style={{ fontSize: 10, color: '#1a1a1a' }}>240 MHz · Wi-Fi & BLE 5</span>
            </div>
          </article>

          <article className="feature-card">
            <div className="feature-card-top">
              <span className="feature-card-index mono-tag">C / 03</span>
              <span className="feature-card-label mono-tag">Expansion</span>
            </div>
            <div>
              <h3>Room to go further.</h3>
              <p className="feature-card-desc">
                microSD card slot on dedicated SPI for massive local data-logging, plug-and-play Qwiic / JST-GH I2C connector,
                TI BQ24092 1A LiPo charging with battery power-path, and native USB-C.
              </p>
            </div>
            <div className="feature-card-footer">
              <span className="mono-tag" style={{ fontSize: 10, color: 'var(--muted)' }}>microSD · Qwiic · LiPo</span>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
