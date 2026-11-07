'use client';

import React from 'react';

const SPECS = [
  { name: 'Core', value: 'ESP32-S3FN8', note: 'Dual-core / 240 MHz' },
  { name: 'Memory', value: '8 MB flash', note: 'No PSRAM / QIO 80 MHz' },
  { name: 'Sensing', value: '6-axis IMU', note: 'Accelerometer + gyroscope' },
  { name: 'Power', value: 'LiPo ready', note: 'BQ24092 charger onboard' },
  { name: 'I/O', value: 'USB-C · Qwiic · microSD', note: 'Analog / touch / digital / PWM' },
  { name: 'Wi-Fi', value: '802.11 b/g/n', note: '2.4 GHz PCB trace antenna' },
  { name: 'Bluetooth', value: 'BLE 5', note: 'Long-range coded PHY, mesh' },
  { name: 'Storage', value: 'microSD (push-pull)', note: 'Dedicated high-speed SPI bus' },
  { name: 'Headers', value: '2 × 14-pin', note: '28 GPIOs · ADC / Touch / PWM' },
  { name: 'LEDs', value: 'RGB array', note: '3 independent channels + power LED' },
  { name: 'Dimensions', value: 'Compact form factor', note: 'Breadboard-compatible footprint' },
];

export default function Specs() {
  return (
    <section className="spec-section" id="specs">
      <div className="section-wrap">
        <div className="section-label reveal">
          <span>02</span>
          <span>The details</span>
        </div>
        <div className="spec-heading">
          <h2 className="reveal">Small footprint.<br /><em>Serious range.</em></h2>
          <p className="reveal delay-one">
            Elyssa gives prototypes a capable, dependable home. No mystery hardware. No locked-in black box.
          </p>
        </div>
        <div className="spec-list reveal delay-two">
          {SPECS.map((row) => (
            <div key={row.name} className="spec-row">
              <span className="spec-name">{row.name}</span>
              <strong>{row.value}</strong>
              <span>{row.note}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
