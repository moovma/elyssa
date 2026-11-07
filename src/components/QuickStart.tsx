'use client';

import React, { useState } from 'react';

const BOARD_URL =
  'https://raw.githubusercontent.com/yassinechouk/Elyssa-dev-board/main/elyssa-arduino/package_moovma_elyssa_index.json';

export default function QuickStart() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(BOARD_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = BOARD_URL;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <section className="quickstart-section" id="quickstart">
      <div className="section-wrap">
        <div className="section-label">
          <span>03</span>
          <span>Quick Start Guide</span>
        </div>

        <div className="quickstart-grid">
          <div className="quickstart-sticky">
            <h2>
              Blink in<br />
              four <em>steps.</em>
            </h2>
            <p>
              Elyssa integrates directly with the official Arduino IDE environment.
              Install the board package once, connect the board via USB-C, and upload your first firmware.
            </p>
            <a
              className="text-link"
              href="https://github.com/moovma/Elyssa-dev-board#getting-started-arduino-ide"
              target="_blank"
              rel="noreferrer"
            >
              Full getting started guide on GitHub
            </a>
          </div>

          <ol className="quickstart-steps">
            <li className="quickstart-step">
              <span className="quickstart-step-num">01</span>
              <div className="quickstart-step-body">
                <h3>Install Arduino IDE 2</h3>
                <p>
                  Download and install the official Arduino IDE 2 for your operating system (Windows, macOS, or Linux).
                </p>
                <a
                  className="button button-dark"
                  href="https://www.arduino.cc/en/software"
                  target="_blank"
                  rel="noreferrer"
                >
                  Download Arduino IDE
                </a>
              </div>
            </li>

            <li className="quickstart-step">
              <span className="quickstart-step-num">02</span>
              <div className="quickstart-step-body">
                <h3>Add the Elyssa Board Package</h3>
                <p>
                  Open <strong>File → Preferences</strong> (or <strong>Arduino IDE → Settings</strong> on macOS)
                  and paste this URL into <strong>Additional boards manager URLs</strong>:
                </p>

                <div className="code-box">
                  <code>{BOARD_URL}</code>
                  <button
                    type="button"
                    className="code-copy-btn"
                    onClick={handleCopy}
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>

                <p>
                  Open <strong>Tools → Board → Boards Manager</strong>, search for <strong>Moovma</strong>, and click <strong>Install</strong>.
                </p>
              </div>
            </li>

            <li className="quickstart-step">
              <span className="quickstart-step-num">03</span>
              <div className="quickstart-step-body">
                <h3>Connect Elyssa via USB-C</h3>
                <p>
                  Connect the board to your computer using a USB-C data cable.
                  Select <strong>Tools → Board → Moovma → Elyssa</strong>, then select <strong>Tools → Port</strong> and pick the serial port labeled <strong>Elyssa</strong>.
                </p>
              </div>
            </li>

            <li className="quickstart-step">
              <span className="quickstart-step-num">04</span>
              <div className="quickstart-step-body">
                <h3>Upload Your First Sketch</h3>
                <p>
                  Open <strong>File → Examples → 01.Basics → Blink</strong> and click the <strong>Upload</strong> button.
                  The on-board LED begins blinking immediately.
                </p>

                <div className="quickstart-tip">
                  <span className="quickstart-tip-label">Manual Bootloader Recovery</span>
                  <p>
                    If the initial upload fails: hold down the <strong>BOOT</strong> button, press and release the <strong>RESET</strong> button, then release <strong>BOOT</strong>.
                    Select the serial port that reappears and click upload again.
                  </p>
                </div>
              </div>
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
}
