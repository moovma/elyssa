'use client';

export default function Features() {
  return (
    <section className="intro section-wrap" id="inside">
      <div className="section-label reveal">
        <span>01</span>
        <span>The idea</span>
      </div>
      <div className="intro-grid">
        <h2 className="reveal">Tunisia doesn’t just<br />use technology.<br />It <em>builds it.</em></h2>
        <div className="intro-copy reveal delay-one">
          <p>
            We believe the future of Tunisia is made by people who dare to invent. Elyssa is our first step: the first
            Tunisian dev board, designed so anyone with curiosity can go from an idea to a working prototype
            in an afternoon.
          </p>
          <p>
            Wireless, motion-aware and ready for the Arduino IDE. Everything useful is already on the board, so your
            attention stays on the thing you’re making.
          </p>
          <a
            className="text-link"
            href="https://github.com/moovma/Elyssa-dev-board#features"
            target="_blank"
            rel="noreferrer"
          >
            See the full feature list <span>↗</span>
          </a>
        </div>
      </div>

    </section>
  );
}
