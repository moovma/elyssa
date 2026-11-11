'use client';

import React from 'react';

const IDEAS = [
  { n: '01', title: 'Your first IoT project', text: 'Read a sensor, send the data over Wi-Fi, watch it live on your phone.' },
  { n: '02', title: 'Motion-controlled gadgets', text: 'Tilt, tap or shake to trigger anything: lights, games, a robot.' },
  { n: '03', title: 'Battery-powered wearables', text: 'Add a LiPo cell and Elyssa charges it for you. Take your project anywhere.' },
  { n: '04', title: 'Data loggers', text: 'Record temperature, movement or anything you measure straight to a microSD card.' },
  { n: '05', title: 'Smart home & campus', text: 'Connect rooms, doors and plants to Wi-Fi or Bluetooth, from the lab to your living room.' },
];

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
            dev board made in Tunisia, designed so anyone with curiosity can go from an idea to a working prototype
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

      <div className="feature-grid">
        <article className="feature-card feature-card-wide reveal">
          <div className="feature-card-top">
            <span className="card-index">A / 01</span>
            <span className="card-icon">✳</span>
          </div>
          <h3>Feel the world<br />around it.</h3>
          <p>
            A 6-axis motion sensor spots taps, shakes, free-fall and steps, even wakes the board from deep sleep. Movement becomes code.
          </p>
          <span className="card-arrow">↗</span>
        </article>
        <article className="feature-card feature-card-olive reveal delay-one">
          <div className="feature-card-top">
            <span className="card-index">B / 02</span>
            <span className="card-icon">⌁</span>
          </div>
          <h3>Connected<br />from day one.</h3>
          <p>Dual-core ESP32-S3 with Wi-Fi and Bluetooth LE 5 built in. Talk to the cloud, your phone, or your own network.</p>
          <span className="card-arrow">↗</span>
        </article>
        <article className="feature-card feature-card-outline reveal delay-two">
          <div className="feature-card-top">
            <span className="card-index">C / 03</span>
            <span className="card-icon">●</span>
          </div>
          <h3>Room to<br />grow.</h3>
          <p>microSD storage, Qwiic plug-and-play sensors, LiPo charging and native USB-C. Start simple, then keep going.</p>
          <span className="card-arrow">↗</span>
        </article>
      </div>

      <div className="ideas reveal">
        <div className="ideas-head">
          <h3>What will <em>you</em> build?</h3>
          <p>Not sure where to start? Here are five ideas Elyssa is made for.</p>
        </div>
        <ul className="ideas-list">
          {IDEAS.map((i) => (
            <li key={i.n}>
              <small>{i.n}</small>
              <strong>{i.title}</strong>
              <span>{i.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
