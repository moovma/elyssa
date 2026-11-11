'use client';

import React from 'react';

const SPECS = [
  { name: 'Brain', value: 'ESP32-S3FN8', note: 'Dual-core, 240 MHz, plenty fast for real projects' },
  { name: 'Memory', value: '8 MB flash', note: 'Room for big sketches (no PSRAM)' },
  { name: 'Motion', value: '6-axis IMU', note: 'Accelerometer + gyroscope, with tap, step and free-fall detection' },
  { name: 'Battery', value: 'LiPo ready', note: 'Built-in BQ24092 charger, so just plug in a battery' },
  { name: 'Connect', value: 'USB-C · Qwiic · microSD', note: 'Program over USB, add sensors without soldering, store data on a card' },
  { name: 'Wi-Fi', value: '2.4 GHz', note: 'On-board PCB antenna, no extra module needed' },
  { name: 'Bluetooth', value: 'BLE 5', note: 'Pair with phones and other Bluetooth devices' },
  { name: 'Storage', value: 'microSD slot', note: 'Its own SPI bus, so it never fights with your other pins' },
  { name: 'Pins', value: '22-pin header', note: 'IO0 to IO6 (analog / touch), I2C, SPI, UART and 3 PWM outputs' },
  { name: 'Lights', value: 'RGB LED + status LEDs', note: 'Three colour channels, plus power, TX, RX and charge indicators' },
  { name: 'Software', value: 'Arduino IDE', note: 'Open source, with ready-made LED and motion-sensor functions' },
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
          <h2 className="reveal">Small board.<br /><em>Big ambitions.</em></h2>
          <p className="reveal delay-one">
            No mystery hardware. No locked-in black box. Every schematic, every pin and every line of code is open, so you always know exactly what you are building on.</p>
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
