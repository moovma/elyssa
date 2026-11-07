'use client';

import React from 'react';

const SPEC_DATA = [
  {
    category: 'Compute & Memory',
    key: 'Core Processor',
    value: 'ESP32-S3FN8',
    note: 'Xtensa® dual-core 32-bit LX7 up to 240 MHz, 512 KB SRAM',
  },
  {
    category: 'Compute & Memory',
    key: 'Onboard Flash',
    value: '8 MB Quad-SPI',
    note: '80 MHz high-speed QIO mode for firmware and file storage',
  },
  {
    category: 'Connectivity',
    key: 'Wi-Fi & Bluetooth',
    value: '2.4 GHz 802.11 b/g/n + BLE 5',
    note: 'Long-range coded PHY, Bluetooth mesh, PCB trace antenna',
  },
  {
    category: 'Sensing',
    key: 'Motion Sensor (IMU)',
    value: 'ST LSM6DS3TR-C (6-Axis)',
    note: '3D accelerometer (±2 to ±16g) + 3D gyro (±125 to ±2000 dps)',
  },
  {
    category: 'Power Management',
    key: 'LiPo Charger (BMS)',
    value: 'TI BQ24092 (1A)',
    note: 'Linear Li-Ion/Li-Polymer charger with automatic power-path',
  },
  {
    category: 'Power Management',
    key: '3.3V Power Rail',
    value: 'High-Efficiency Buck',
    note: 'DC-DC step-down converter delivering stable power under RF bursts',
  },
  {
    category: 'Storage & I/O',
    key: 'Removable Storage',
    value: 'microSD Slot (Push-Pull)',
    note: 'Hardware push-pull socket on dedicated high-speed SPI bus',
  },
  {
    category: 'Storage & I/O',
    key: 'Sensor Expansion',
    value: 'Qwiic / JST-GH 4-Pin',
    note: 'Standard 1mm pitch I2C connector for plug-and-play sensors',
  },
  {
    category: 'Storage & I/O',
    key: 'USB Port',
    value: 'USB-C Receptacle',
    note: 'Native USB OTG, USB-Serial CDC flashing, ESD protection',
  },
  {
    category: 'Prototyping',
    key: 'Breadboard Headers',
    value: '2x 14-Pin (28 GPIOs)',
    note: 'Standard 2.54mm pitch: ADC1, ADC2, Touch, PWM, UART, SPI',
  },
  {
    category: 'User Interface',
    key: 'Buttons & LEDs',
    value: 'RGB LED Array + Reset/Boot',
    note: '3 independent RGB channels, user power/charge LEDs, tactile switches',
  },
];

export default function Specs() {
  return (
    <section className="specs-section" id="specs">
      <div className="section-wrap">
        <div className="section-label light">
          <span>02</span>
          <span>Technical Specifications</span>
        </div>

        <div className="specs-header">
          <h2>
            Small footprint.<br />
            <em>Serious range.</em>
          </h2>
          <p>
            Elyssa provides a reliable open-source hardware base for sensor devices, robotics, and connected prototypes.
            Every trace, component, and pin is documented in KiCad with full transparency.
          </p>
        </div>

        <div className="specs-table">
          {SPEC_DATA.map((row) => (
            <div key={row.key} className="specs-row">
              <span className="specs-key">{row.key}</span>
              <strong className="specs-val">{row.value}</strong>
              <span className="specs-note">{row.note}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
