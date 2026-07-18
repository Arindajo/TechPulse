'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { INTEREST_OPTIONS } from '../../lib/interests';
import { saveIdentity, loadIdentity } from '../../lib/identity';

export default function RegisterForm({ eventId }: { eventId: string }) {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [optInMatching, setOptInMatching] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Pre-fill from a previous visit so returning attendees don't retype everything
  useEffect(() => {
    const saved = loadIdentity();
    if (saved) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(saved.name);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPhoneNumber(saved.phoneNumber);
    }
  }, []);

  function toggleInterest(label: string) {
    setInterests((prev) =>
      prev.includes(label) ? prev.filter((i) => i !== label) : [...prev, label]
    );
  }

  // Submit registration to the API and send an SMS confirmation
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');

    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId, name, phoneNumber, interests, optInMatching }),
    });

    if (res.ok) {
      saveIdentity({ name, phoneNumber });
      setStatus('success');
    } else {
      const body = await res.json().catch(() => ({}));
      setErrorMessage(body.error ?? 'Registration failed. Try again.');
      setStatus('error');
    }
  }

  // Success state
  if (status === 'success') {
    return (
      <div className="text-center stack-sm">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#9dff7e] flex items-center justify-center text-3xl shadow-lg shadow-[#9dff7e]/25">
          🎉
        </div>
        <p className="text-lg font-bold text-[#effff6]">You&apos;re in, {name.split(' ')[0]}!</p>
        <p className="text-sm tp-muted mt-1">Confirmation sent to {phoneNumber}.</p>

        <div className="stack-sm mt-2">
          {optInMatching && (
            <Link
              href={`/events/${eventId}/match?phone=${encodeURIComponent(phoneNumber)}`}
              className="tp-btn-primary"
            >
              ✨ Find my match
            </Link>
          )}
          <Link
            href={`/events/${eventId}/chat?phone=${encodeURIComponent(phoneNumber)}&name=${encodeURIComponent(name)}`}
            className="tp-btn-secondary"
          >
            💬 Join event chat
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="stack-md">
      <div className="stack-sm">
        <input
          type="text"
          required
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="tp-input"
        />
        <input
          type="tel"
          required
          placeholder="Phone number (e.g. 0700000000)"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          className="tp-input"
        />
      </div>

      <div>
        <p className="event-form-section-title">Your interests</p>
        <p className="event-form-section-subtitle">Pick at least one so your match suggestions are better.</p>
        <div className="event-interest-grid">
          {INTEREST_OPTIONS.map((interest) => {
            const selected = interests.includes(interest.label);
            return (
              <button
                type="button"
                key={interest.label}
                onClick={() => toggleInterest(interest.label)}
                className={`event-interest-button ${selected ? 'event-interest-button-active' : ''}`}
              >
                {interest.emoji} {interest.label}
              </button>
            );
          })}
        </div>
      </div>

      <label className="soft-note row-wrap cursor-pointer">
        <input
          type="checkbox"
          checked={optInMatching}
          onChange={(e) => setOptInMatching(e.target.checked)}
          className="mt-0.5 w-4 h-4 accent-[#9dff7e]"
        />
        <span className="text-sm text-[#d7efe2]">
          <span className="font-semibold text-[#ddffcf]">✨ Match me with someone at this event</span>
          We&apos;ll pair you with an attendee who shares your interests and give you both an icebreaker question.
        </span>
      </label>

      <button
        type="submit"
        disabled={status === 'loading'}
        className="tp-btn-primary w-full"
      >
        {status === 'loading' ? 'Registering...' : 'Register'}
      </button>
      {status === 'error' && (
        <p className="text-sm tp-danger text-center">{errorMessage}</p>
      )}
    </form>
  );
}
