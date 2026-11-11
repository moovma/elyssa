'use client';

import { useState } from 'react';
import { CONTACT_EMAIL } from '../lib/elyssa-docs';
import { track } from '../lib/track';

/** Opens the visitor's mail app with a pre-filled message to Moovma (no server, no data stored). */
export default function ContactForm({ id = 'contact' }: { id?: string }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('Hardware question');
  const [message, setMessage] = useState('');

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = `[Elyssa] ${topic}`;
    const body = `${message}\n\n—\n${name}\n${email}`;
    track('contact_form_submit', { topic });
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <form className="contact-form" id={id} onSubmit={send}>
      <div className="contact-row">
        <label>
          <span>Name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Your name" />
        </label>
        <label>
          <span>Your email</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@example.com" />
        </label>
      </div>
      <label>
        <span>Topic</span>
        <select value={topic} onChange={(e) => setTopic(e.target.value)}>
          <option>Hardware question</option>
          <option>Pre-order question</option>
          <option>Software / Arduino question</option>
          <option>Something else</option>
        </select>
      </label>
      <label>
        <span>Your question</span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={5}
          placeholder="Which pin can I use for…?"
        />
      </label>
      <div className="contact-actions">
        <button type="submit" className="button button-acid">Send email</button>
        <a className="text-link" href={`mailto:${CONTACT_EMAIL}`}>or write to {CONTACT_EMAIL}</a>
      </div>
    </form>
  );
}
