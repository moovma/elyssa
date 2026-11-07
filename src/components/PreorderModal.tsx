'use client';

import React, { useState } from 'react';

interface PreorderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PreorderModal({ isOpen, onClose }: PreorderModalProps) {
  const [tier, setTier] = useState('board');
  const [email, setEmail] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    setEmail('');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Close dialog"
        >
          ✕
        </button>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '24px 8px' }}>
            <div style={{ fontSize: 44, color: '#10b981', marginBottom: 16 }}>✓</div>
            <h3 style={{ fontSize: 28, marginBottom: 8 }}>Pre-order Reserved!</h3>
            <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
              Thank you for supporting open hardware! A reservation confirmation has been sent to{' '}
              <strong>{email}</strong>. We will contact you before shipment with your dispatch tracking.
            </p>
            <button
              type="button"
              className="button button-dark"
              onClick={handleReset}
              style={{ width: '100%' }}
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mono-tag" style={{ color: 'var(--muted)', marginBottom: 8 }}>
              Batch 01 Pre-order Reservation
            </div>
            <h3 className="modal-title">Pre-order Elyssa</h3>
            <p className="modal-subtitle">
              Join makers worldwide and reserve your board before first production batch allocation fills up.
            </p>

            <div className="modal-form-group">
              <label htmlFor="tier-select">Choose Package</label>
              <select
                id="tier-select"
                value={tier}
                onChange={(e) => setTier(e.target.value)}
              >
                <option value="board">Elyssa Board Only — $24.00 (Early Bird)</option>
                <option value="kit">Maker Starter Kit (Board + Sensors + Cable) — $34.00</option>
                <option value="lab">Lab Pack (5x Elyssa Boards) — $110.00</option>
              </select>
            </div>

            <div className="modal-form-group">
              <label htmlFor="quantity">Quantity</label>
              <input
                id="quantity"
                type="number"
                min={1}
                max={20}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              />
            </div>

            <div className="modal-form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                required
                placeholder="developer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="button button-acid"
              style={{ width: '100%', marginTop: 12, padding: '14px', fontSize: 12 }}
            >
              Confirm Pre-order Reservation <span>→</span>
            </button>

            <p style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', marginTop: 12 }}>
              No upfront payment required. You will only be billed when production units are ready to ship.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
