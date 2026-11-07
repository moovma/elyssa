'use client';

import React, { useState } from 'react';

const BOARD_URL =
  'https://raw.githubusercontent.com/yassinechouk/Elyssa-dev-board/main/elyssa-arduino/package_moovma_elyssa_index.json';

export default function QuickStart() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(BOARD_URL);
    } catch {
      const t = document.createElement('textarea');
      t.value = BOARD_URL;
      document.body.appendChild(t);
      t.select();
      document.execCommand('copy');
      document.body.removeChild(t);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="quick-section section-wrap" id="quickstart">
      <div className="section-label reveal">
        <span>03</span>
        <span>Quick start</span>
      </div>
      <div className="quick-grid">
        <div className="quick-intro reveal">
          <h2>Blink in<br />four <em>steps.</em></h2>
          <p>
            Elyssa works with the Arduino IDE. Install the board package once, plug in the board, and upload your first sketch in a few minutes.
          </p>
          <a
            className="text-link"
            href="https://github.com/moovma/Elyssa-dev-board#getting-started-arduino-ide"
            target="_blank"
            rel="noreferrer"
          >
            Full guide on GitHub <span>↗</span>
          </a>
        </div>

        <ol className="quick-steps">
          <li className="quick-step reveal">
            <span className="quick-number">01</span>
            <div className="quick-body">
              <h3>Install Arduino IDE 2</h3>
              <p>Download and install the latest Arduino IDE 2 for your system. On Linux and macOS you also need Python 3.</p>
              <a className="button button-dark" href="https://www.arduino.cc/en/software" target="_blank" rel="noreferrer">
                Download Arduino IDE <span>↗</span>
              </a>
            </div>
          </li>

          <li className="quick-step reveal">
            <span className="quick-number">02</span>
            <div className="quick-body">
              <h3>Add the Elyssa board package</h3>
              <p>Open <strong>File → Preferences</strong> and paste this link in <strong>Additional boards manager URLs</strong>:</p>
              <div className="code-block">
                <code>{BOARD_URL}</code>
                <button
                  type="button"
                  className={`copy-button${copied ? ' is-copied' : ''}`}
                  onClick={handleCopy}
                >
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <p>Then open <strong>Tools → Board → Boards Manager</strong>, search <strong>Moovma</strong> and click <strong>Install</strong>.</p>
            </div>
          </li>

          <li className="quick-step reveal">
            <span className="quick-number">03</span>
            <div className="quick-body">
              <h3>Connect the board</h3>
              <p>
                Plug Elyssa in with a USB-C <strong>data</strong> cable. Select <strong>Tools → Board → Moovma → Elyssa</strong>, then <strong>Tools → Port</strong> and pick the port labelled <strong>Elyssa</strong>. Leave the other Tools options at their defaults.
              </p>
            </div>
          </li>

          <li className="quick-step reveal">
            <span className="quick-number">04</span>
            <div className="quick-body">
              <h3>Upload your first sketch</h3>
              <p>Open <strong>File → Examples → 01.Basics → Blink</strong> and click <strong>Upload</strong>. The on-board LED starts blinking.</p>
              <div className="quick-note">
                <span className="quick-note-label">If the upload fails</span>
                <p>Hold <strong>BOOT</strong>, press and release <strong>RESET</strong>, then release <strong>BOOT</strong>. Select the port that appears and upload again. This is usually only needed once.</p>
              </div>
            </div>
          </li>
        </ol>
      </div>
    </section>
  );
}
