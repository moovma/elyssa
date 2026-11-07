'use client';

import React from 'react';

const DOC_LINKS = [
  {
    num: '01',
    title: 'Hardware Overview & README',
    desc: 'General architecture, block diagrams, power topology, and pinout mapping.',
    url: 'https://github.com/moovma/Elyssa-dev-board/blob/main/README.md',
  },
  {
    num: '02',
    title: 'ElyssaIMU Arduino Library',
    desc: 'Drivers, filtering algorithms, tap detection, and orientation examples for LSM6DS3TR-C.',
    url: 'https://github.com/moovma/Elyssa-dev-board/tree/main/platform/libraries/ElyssaIMU',
  },
  {
    num: '03',
    title: 'KiCad v3 Schematics & PCB Layout',
    desc: 'Complete schematic sheets, PCB layout, Gerber files, and Bill of Materials.',
    url: 'https://github.com/moovma/Elyssa-dev-board',
  },
  {
    num: '04',
    title: 'Arduino Board Package Index',
    desc: 'JSON index file and toolchain definitions for one-click installation via Boards Manager.',
    url: 'https://raw.githubusercontent.com/yassinechouk/Elyssa-dev-board/main/elyssa-arduino/package_moovma_elyssa_index.json',
  },
  {
    num: '05',
    title: 'Changelog & Revisions',
    desc: 'Track PCB revisions, firmware patches, bug fixes, and hardware changes.',
    url: 'https://github.com/moovma/Elyssa-dev-board/blob/main/CHANGELOG.md',
  },
];

export default function Documentation() {
  return (
    <section className="docs-section" id="documentation">
      <div className="section-wrap">
        <div className="section-label">
          <span>04</span>
          <span>Documentation & Resources</span>
        </div>

        <div className="docs-grid">
          <div className="docs-copy">
            <h2>
              Your next build<br />
              starts <em>here.</em>
            </h2>
            <p>
              Inspect the schematics, review the firmware libraries, and integrate Elyssa into your hardware projects.
              Open-source, community-driven, and maintained on GitHub.
            </p>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <a
                className="button button-acid"
                href="https://github.com/moovma/Elyssa-dev-board"
                target="_blank"
                rel="noreferrer"
              >
                View on GitHub
              </a>
              <a
                className="button button-outline"
                href="https://github.com/moovma/Elyssa-dev-board#getting-started-arduino-ide"
                target="_blank"
                rel="noreferrer"
              >
                Getting Started
              </a>
            </div>
          </div>

          <div className="docs-links">
            {DOC_LINKS.map((link) => (
              <a
                key={link.num}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="docs-link-item"
              >
                <span>
                  <small>{link.num}</small>
                  {link.title}
                </span>
                <span className="docs-link-arrow">→</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
