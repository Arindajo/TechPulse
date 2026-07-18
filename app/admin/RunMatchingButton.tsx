'use client';

import { useState } from 'react';

export default function RunMatchingButton({ eventId }: { eventId: string }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function handleRun() {
    setStatus('loading');
    const res = await fetch('/api/match', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId }),
    });
    const body = await res.json();

    if (res.ok) {
      setMessage(`Matched ${body.matched} attendees`);
      setStatus('done');
    } else {
      setMessage(body.error ?? 'Matching failed');
      setStatus('error');
    }
  }

  return (
    <div className="stack-sm items-end">
      <button
        onClick={handleRun}
        disabled={status === 'loading'}
        className="text-sm font-medium text-[#d8ffca] disabled:opacity-50 hover:text-[#eeffd8]"
      >
        {status === 'loading' ? 'Matching...' : '✨ Run Matching'}
      </button>
      {message && (
        <p className={`text-xs ${status === 'error' ? 'tp-danger' : 'tp-success'}`}>
          {message}
        </p>
      )}
    </div>
  );
}
