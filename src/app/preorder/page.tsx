'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const PRICE_OPTIONS = ['80 DT', '95 DT', '110 DT', '130 DT', '150 DT'];

export default function PreorderPage() {
  const [firstName, setFirstName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [age, setAge] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isStudent, setIsStudent] = useState(true);
  const [offeredPrice, setOfferedPrice] = useState('95 DT');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [actualPrice, setActualPrice] = useState('70 DT');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!firstName.trim() || !familyName.trim() || !email.trim() || !phone.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/preorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          familyName,
          age: parseInt(age) || 0,
          email,
          phone,
          isStudent,
          offeredPrice,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit pre-order');
      }

      setActualPrice(data.actualPrice || '70 DT');
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="preorder-page-wrapper">
      {/* Top Header */}
      <div className="preorder-top-nav">
          <div className="section-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%' }}>
            <Link href="/" className="brand-link" aria-label="Back to Elyssa home">
              <img src="/PNG/Moovma Black@2x.png" alt="Moovma" className="brand-logo-img" />
              <span className="brand-badge">ELYSSA / V3</span>
            </Link>
            <Link href="/" className="text-link">
              Back to Overview
            </Link>
          </div>
        </div>

      <main className="preorder-main-container">
        <div className="section-wrap" style={{ maxWidth: 640 }}>
          {submitted ? (
            /* Reveal screen after submission */
            <div className="preorder-reveal-card">
              <div className="reveal-badge">Pre-order Confirmed</div>
              
              <h1 className="reveal-heading">
                The official price is <em>{actualPrice}</em>
              </h1>

              <div className="reveal-comparison-box">
                <div className="reveal-comparison-item">
                  <span className="comparison-label">Your Estimated Value</span>
                  <span className="comparison-value strike">{offeredPrice}</span>
                </div>
                <div className="reveal-comparison-divider">→</div>
                <div className="reveal-comparison-item highlight">
                  <span className="comparison-label">Actual Community Price</span>
                  <span className="comparison-value highlight-price">{actualPrice}</span>
                </div>
              </div>

              <div className="reveal-message-body">
                <p>
                  Thank you, <strong>{firstName} {familyName}</strong>. Your pre-order for the Elyssa development board has been registered.
                </p>
                <p>
                  We priced Elyssa at <strong>70 DT</strong> to ensure open hardware remains accessible to makers, students, and engineers in Tunisia and worldwide.
                </p>
                <div className="reveal-notice-box">
                  <strong>Next steps:</strong> Please wait for a confirmation phone call at <strong>{phone}</strong> or an email at <strong>{email}</strong> from the Moovma engineering team to confirm your batch allocation and delivery timeline.
                </div>
              </div>

              <div style={{ marginTop: 32, display: 'flex', gap: 14, justifyContent: 'center' }}>
                <Link href="/" className="button button-dark">
                  Return to Overview
                </Link>
              </div>
            </div>
          ) : (
            /* Pre-order Form */
            <div className="preorder-form-card">
              <div className="mono-tag" style={{ color: 'var(--muted)', marginBottom: 12 }}>
                Batch 01 · Reservation
              </div>

              <h1 className="preorder-form-title">
                Reserve your <em>Elyssa board</em>
              </h1>
              <p className="preorder-form-subtitle">
                Fill in your details below to secure your unit from the first production run.
              </p>

              {error && (
                <div className="form-error-banner">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="preorder-actual-form">
                {/* Name Row */}
                <div className="form-row-two-col">
                  <div className="form-field-group">
                    <label htmlFor="first-name">First Name *</label>
                    <input
                      id="first-name"
                      type="text"
                      required
                      placeholder="Hamza"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>

                  <div className="form-field-group">
                    <label htmlFor="family-name">Family Name *</label>
                    <input
                      id="family-name"
                      type="text"
                      required
                      placeholder="Bejaoui"
                      value={familyName}
                      onChange={(e) => setFamilyName(e.target.value)}
                    />
                  </div>
                </div>

                {/* Age & Phone Row */}
                <div className="form-row-two-col">
                  <div className="form-field-group">
                    <label htmlFor="age">Age</label>
                    <input
                      id="age"
                      type="number"
                      min={10}
                      max={120}
                      placeholder="23"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                    />
                  </div>

                  <div className="form-field-group">
                    <label htmlFor="phone">Phone Number *</label>
                    <input
                      id="phone"
                      type="tel"
                      required
                      placeholder="+216 98 123 456"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div className="form-field-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="maker@moovma.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                {/* iPhone-style Segmented Selector: Student vs Professional */}
                <div className="form-field-group">
                  <label>Occupation / Status</label>
                  <div className="ios-segmented-control" role="radiogroup" aria-label="Student or Non-student">
                    <button
                      type="button"
                      className={`ios-segment-btn ${isStudent ? 'is-active' : ''}`}
                      onClick={() => setIsStudent(true)}
                      role="radio"
                      aria-checked={isStudent}
                    >
                      Student
                    </button>
                    <button
                      type="button"
                      className={`ios-segment-btn ${!isStudent ? 'is-active' : ''}`}
                      onClick={() => setIsStudent(false)}
                      role="radio"
                      aria-checked={!isStudent}
                    >
                      Non-student / Pro
                    </button>
                  </div>
                </div>

                {/* Estimated Value Question: 5 choices between 80 and 150 */}
                <div className="form-field-group">
                  <label>
                    What is the best price you would pay for Elyssa? (DT)
                  </label>
                  <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: -2, marginBottom: 10 }}>
                    Select your estimated fair value among these options:
                  </p>
                  <div className="price-options-grid">
                    {PRICE_OPTIONS.map((price) => (
                      <button
                        key={price}
                        type="button"
                        className={`price-option-pill ${offeredPrice === price ? 'is-selected' : ''}`}
                        onClick={() => setOfferedPrice(price)}
                      >
                        {price}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <div style={{ marginTop: 28 }}>
                  <button
                    type="submit"
                    disabled={loading}
                    className="button button-acid"
                    style={{ width: '100%', padding: '16px 24px', fontSize: 13 }}
                  >
                    {loading ? 'Submitting Reservation...' : 'Submit Pre-order'}
                  </button>
                </div>

                <p style={{ fontSize: 12, color: 'var(--muted)', textAlign: 'center', marginTop: 14 }}>
                  No immediate payment required. You will only pay when your board is ready for dispatch.
                </p>
              </form>
            </div>
          )}
        </div>
      </main>

      {/* Clean Footer */}
      <footer className="site-footer" style={{ marginTop: 'auto' }}>
        <div className="section-wrap footer-inner">
          <div className="footer-center-brand">
            <span className="footer-copyright-logo" title="Copyright">©</span>
            <img src="/PNG/Moovma White@2x.png" alt="Moovma Logo" className="footer-moovma-logo" />
            <span className="footer-brand-title">ELYSSA / DEV BOARD</span>
          </div>
          <div className="footer-bottom-copy">
            <span>Open Hardware from Tunisia</span>
            <span>·</span>
            <span>© 2026 MOOVMA. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
