'use client';

import { useEffect, useRef, useState } from 'react';
import { CONTACT_EMAIL } from '../lib/elyssa-docs';
import { track } from '../lib/track';

type Status = 'idle' | 'sending' | 'sent' | 'error';

/**
 * Sends the message to Moovma through /api/contact (Resend). Nothing is stored.
 * If sending fails, the visitor can still open their own mail app with the message pre-filled.
 */
export default function ContactForm({ id = 'contact' }: { id?: string }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('Hardware question');
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState(''); // hidden anti-spam field, people never see it
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');
  const startedAt = useRef(0);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  const mailtoHref = () => {
    const subject = `[Elyssa] ${topic}`;
    const body = `${message}\n\n—\n${name}\n${email}`;
    return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'sending') return;
    setStatus('sending');
    setError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, topic, message, website, startedAt: startedAt.current, page: window.location.pathname }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.sent) {
        setStatus('error');
        setError(res.status === 400 && data.error ? data.error : 'Your message could not be sent right now.');
        return;
      }
      track('contact_form_submit', { topic });
      setStatus('sent');
    } catch {
      setStatus('error');
      setError('Your message could not be sent right now. Check your connection and try again.');
    }
  };

  if (status === 'sent') {
    return (
      <div className="contact-form contact-sent" id={id} role="status">
        <span className="contact-sent-icon" aria-hidden="true">✓</span>
        <h3>Message sent.</h3>
        <p>Thanks {name.split(' ')[0] || ''}! We read every message and reply to <b>{email}</b> as soon as we can.</p>
        <button
          type="button"
          className="text-link contact-again"
          onClick={() => {
            setMessage('');
            setStatus('idle');
            startedAt.current = Date.now();
          }}
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form className="contact-form" id={id} onSubmit={send}>
      <div className="contact-row">
        <label>
          <span>Name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} required maxLength={100} placeholder="Your name" />
        </label>
        <label>
          <span>Your email</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={200} placeholder="you@example.com" />
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
          maxLength={5000}
          rows={5}
          placeholder="Which pin can I use for…?"
        />
      </label>
      {/* Honeypot: hidden from people and screen readers, bots fill it in */}
      <label className="contact-hp" aria-hidden="true">
        <span>Website</span>
        <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
      </label>
      {status === 'error' && (
        <p className="contact-error" role="alert">
          {error}{' '}
          <a className="text-link" href={mailtoHref()}>Send it from your mail app instead</a>
        </p>
      )}
      <div className="contact-actions">
        <button type="submit" className="button button-acid" disabled={status === 'sending'} aria-busy={status === 'sending'}>
          {status === 'sending' ? 'Sending…' : 'Send message'}
        </button>
        <a className="text-link" href={`mailto:${CONTACT_EMAIL}`}>or write to {CONTACT_EMAIL}</a>
      </div>
    </form>
  );
}
