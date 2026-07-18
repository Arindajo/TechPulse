'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { saveIdentity } from '../lib/identity';

export default function LoginPage() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');

    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber }),
    });

    if (res.ok) {
      const { name } = await res.json();
      saveIdentity({ name, phoneNumber });
      router.push('/events');
    } else {
      const body = await res.json().catch(() => ({}));
      setErrorMessage(body.error ?? 'Login failed. Try again.');
      setStatus('error');
    }
  }

  return (
    <main className="app-shell-centered">
      <div className="app-container-narrow glass-panel panel-pad-lg stack-md text-center">
        <div className="text-3xl mb-2">👋</div>
        <h1 className="section-title">Welcome back</h1>
        <p className="section-subtitle">
          Enter the phone number you registered with to pick up where you left off.
        </p>

        <form onSubmit={handleSubmit} className="stack-sm">
          <input
            type="tel"
            required
            placeholder="Phone number (e.g. 0700000000)"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="tp-input text-center"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="tp-btn-primary w-full"
          >
            {status === 'loading' ? 'Logging in...' : 'Log in'}
          </button>
          {status === 'error' && <p className="text-sm tp-danger">{errorMessage}</p>}
        </form>

        <p className="text-xs tp-muted">
          New here?{' '}
          <Link href="/events" className="font-semibold text-[#dcffb8]">
            Browse events
          </Link>{' '}
          and register to create your account.
        </p>
      </div>
    </main>
  );
}
