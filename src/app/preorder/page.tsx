'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const PRICE_OPTIONS = ['80 DT', '95 DT', '110 DT', '130 DT', '150 DT'];

export default function PreorderPage() {
  const [firstName, setFirstName]     = useState('');
  const [familyName, setFamilyName]   = useState('');
  const [age, setAge]                 = useState('');
  const [email, setEmail]             = useState('');
  const [phone, setPhone]             = useState('');
  const [isStudent, setIsStudent]     = useState(true);
  const [offeredPrice, setOfferedPrice] = useState('95 DT');
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [submitted, setSubmitted]     = useState(false);
  const [actualPrice, setActualPrice] = useState('70 DT');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!firstName.trim() || !familyName.trim() || !email.trim() || !phone.trim()) {
      setError('All required fields must be filled in.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/preorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, familyName, age: parseInt(age) || 0, email, phone, isStudent, offeredPrice }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed.');
      setActualPrice(data.actualPrice || '70 DT');
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="preorder-page-wrapper">

      {/* ── Top nav ── */}
      <div className="preorder-top-nav">
        <div className="section-wrap po-nav-inner">
          <Link href="/" className="brand" aria-label="Moovma home">
            <img src="/PNG/Moovma Black@2x.png" alt="Moovma" />
          </Link>
          <Link href="/" className="text-link">← Overview</Link>
        </div>
      </div>

      {/* ── Main content ── */}
      <main className="preorder-main-container">
        <div className="po-content-wrap">

          {submitted ? (
            /* ── Confirmation screen ── */
            <div className="po-confirm">
              <p className="po-eyebrow">Pre-order registered</p>
              <h1 className="po-confirm-heading">
                The board costs <em>{actualPrice}</em>
              </h1>
              <div className="po-price-row">
                <div className="po-price-col">
                  <span className="po-price-label">Your estimate</span>
                  <span className="po-price-val strike">{offeredPrice}</span>
                </div>
                <span className="po-arrow">→</span>
                <div className="po-price-col accent">
                  <span className="po-price-label">Actual price</span>
                  <span className="po-price-val">{actualPrice}</span>
                </div>
              </div>
              <p className="po-confirm-body">
                {firstName} {familyName}, your reservation is in. Elyssa is priced at <strong>70 DT</strong> — built to stay accessible for makers and students across Tunisia.
              </p>
              <div className="po-notice">
                You will receive a confirmation call at <strong>{phone}</strong> or an email at <strong>{email}</strong>.
              </div>
              <Link href="/" className="button button-dark" style={{ marginTop: 28, display: 'inline-flex' }}>
                Back to overview
              </Link>
            </div>

          ) : (
            /* ── Pre-order form ── */
            <div className="po-form-card">
              <p className="po-eyebrow">Batch 01 — Reservation</p>
              <h1 className="po-form-heading">Reserve your <em>Elyssa</em></h1>
              <p className="po-form-sub">Fill in your details to secure a unit from the first run.</p>

              {error && <div className="form-error-banner">{error}</div>}

              <form onSubmit={handleSubmit} className="po-form">

                {/* Name */}
                <div className="po-row-two">
                  <div className="po-field">
                    <label htmlFor="first-name">First name *</label>
                    <input id="first-name" type="text" required placeholder="Hamza"
                      value={firstName} onChange={e => setFirstName(e.target.value)} />
                  </div>
                  <div className="po-field">
                    <label htmlFor="family-name">Family name *</label>
                    <input id="family-name" type="text" required placeholder="Bejaoui"
                      value={familyName} onChange={e => setFamilyName(e.target.value)} />
                  </div>
                </div>

                {/* Age & Phone */}
                <div className="po-row-two">
                  <div className="po-field">
                    <label htmlFor="age">Age</label>
                    <input id="age" type="number" min={10} max={120} placeholder="23"
                      value={age} onChange={e => setAge(e.target.value)} />
                  </div>
                  <div className="po-field">
                    <label htmlFor="phone">Phone *</label>
                    <input id="phone" type="tel" required placeholder="+216 98 123 456"
                      value={phone} onChange={e => setPhone(e.target.value)} />
                  </div>
                </div>

                {/* Email */}
                <div className="po-field">
                  <label htmlFor="email">Email *</label>
                  <input id="email" type="email" required placeholder="you@example.com"
                    value={email} onChange={e => setEmail(e.target.value)} />
                </div>

                {/* Student toggle */}
                <div className="po-field">
                  <label>Status</label>
                  <div className="po-segment" role="radiogroup">
                    <button type="button" className={`po-seg-btn${isStudent ? ' is-active' : ''}`}
                      onClick={() => setIsStudent(true)} aria-checked={isStudent}>Student</button>
                    <button type="button" className={`po-seg-btn${!isStudent ? ' is-active' : ''}`}
                      onClick={() => setIsStudent(false)} aria-checked={!isStudent}>Non-student</button>
                  </div>
                </div>

                {/* Price picker */}
                <div className="po-field">
                  <label>What price would you pay for Elyssa?</label>
                  <div className="po-price-grid">
                    {PRICE_OPTIONS.map(p => (
                      <button key={p} type="button"
                        className={`po-price-btn${offeredPrice === p ? ' is-selected' : ''}`}
                        onClick={() => setOfferedPrice(p)}>{p}</button>
                    ))}
                  </div>
                </div>

                {/* Submit */}
                <button type="submit" disabled={loading} className="button button-acid po-submit">
                  {loading ? 'Submitting...' : 'Reserve my board'}
                </button>
                <p className="po-note">No payment now — you will be contacted before any charge.</p>

              </form>
            </div>
          )}
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="site-footer">
        <div className="footer-inner section-wrap">
          <div className="footer-row">
            <div className="footer-side"><span>Open hardware from Tunisia</span></div>
            <div className="footer-brand">
              <img src="/PNG/Moovma White@2x.png" alt="Moovma" />
              <span>ELYSSA / DEV BOARD</span>
            </div>
            <div className="footer-side">
              <a href="https://github.com/moovma/Elyssa-dev-board" target="_blank" rel="noreferrer">GitHub ↗</a>
            </div>
          </div>
          <div className="footer-copyright">&copy; All rights reserved by MOOVMA</div>
        </div>
      </footer>

    </div>
  );
}
