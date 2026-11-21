'use client';

import React, { useState } from 'react';

const BOARD_URL =
  'https://raw.githubusercontent.com/moovma/Elyssa-dev-board/main/elyssa-arduino/package_moovma_elyssa_index.json';

/** A screenshot from Arduino IDE; tap to open it full size. */
function Shot({ src, w, h, alt }: { src: string; w: number; h: number; alt: string }) {
  return (
    <a className="quick-shot" href={src} target="_blank" rel="noreferrer" aria-label={`${alt} (open full size)`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} width={w} height={h} alt={alt} loading="lazy" decoding="async" />
    </a>
  );
}

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
          <h2>From box to blink<br />in six <em>steps.</em></h2>
          <p>
            No ESP32 experience needed. Follow the pictures: the green boxes show exactly where to click. Six steps and the on-board LED is yours.</p>
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
              <h3>Get Arduino IDE 2</h3>
              <p>Download and install the latest Arduino IDE 2 for your system. On Linux and macOS you also need Python 3.</p>
              <a className="button button-dark" href="https://www.arduino.cc/en/software" target="_blank" rel="noreferrer">
                Download Arduino IDE <span>↗</span>
              </a>
            </div>
          </li>

          <li className="quick-step reveal">
            <span className="quick-number">02</span>
            <div className="quick-body">
              <h3>Open Preferences</h3>
              <p>In Arduino IDE, click <strong>File</strong>, then <strong>Preferences…</strong></p>
              <Shot src="/quickstart/1-file-preferences.webp" w={520} h={552} alt="Arduino IDE File menu with Preferences highlighted" />
            </div>
          </li>

          <li className="quick-step reveal">
            <span className="quick-number">03</span>
            <div className="quick-body">
              <h3>Paste the Elyssa link</h3>
              <p>Copy this link and paste it in <strong>Additional boards manager URLs</strong> (the highlighted box). Then click <strong>OK</strong>.</p>
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
              <Shot src="/quickstart/2-paste-link.webp" w={995} h={648} alt="Arduino IDE Preferences window with the Additional boards manager URLs box highlighted" />
              <p className="quick-tip">Already have another link in that box? Click the small button at its right and put the Elyssa link on a new line.</p>
            </div>
          </li>

          <li className="quick-step reveal">
            <span className="quick-number">04</span>
            <div className="quick-body">
              <h3>Install the Elyssa package</h3>
              <p>Click the <strong>Boards Manager</strong> icon on the left, type <strong>Moovma</strong> and click <strong>Install</strong>. When it says <strong>installed</strong>, you are done here.</p>
              <Shot src="/quickstart/3-boards-manager.webp" w={366} h={320} alt="Arduino IDE Boards Manager showing the Moovma package installed" />
            </div>
          </li>

          <li className="quick-step reveal">
            <span className="quick-number">05</span>
            <div className="quick-body">
              <h3>Plug in and pick Elyssa</h3>
              <p>
                Plug Elyssa in with a USB-C <strong>data</strong> cable. Open <strong>Tools → Board → Moovma → Elyssa</strong>, then <strong>Tools → Port</strong> and pick the Elyssa port. Leave the other Tools options as they are.
              </p>
              <Shot src="/quickstart/4-select-board-port.webp" w={1080} h={506} alt="Arduino IDE Tools menu with Board Elyssa and Port highlighted" />
            </div>
          </li>

          <li className="quick-step reveal">
            <span className="quick-number">06</span>
            <div className="quick-body">
              <h3>Upload Blink and celebrate</h3>
              <p>Open <strong>File → Examples → 01.Basics → Blink</strong>. Check that <strong>Elyssa</strong> is shown at the top, then click the <strong>Upload</strong> arrow. The on-board LED starts blinking: your first program is running on the first Tunisian dev board.</p>
              <Shot src="/quickstart/5-upload.webp" w={460} h={58} alt="Arduino IDE toolbar with the Upload button and Elyssa selected" />
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
