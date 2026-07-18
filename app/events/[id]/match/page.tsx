'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { loadIdentity } from '../../../lib/identity';

type MatchResult = {
  partnerName: string;
  partnerInterests: string[];
  icebreaker: string;
};

export default function MatchPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ phone?: string }>;
}) {
  const { id: eventId } = use(params);
  const { phone: initialPhone } = use(searchParams);

  const [phone, setPhone] = useState(initialPhone ?? '');
  const [status, setStatus] = useState<'idle' | 'loading' | 'found' | 'not-found'>('idle');
  const [result, setResult] = useState<MatchResult | null>(null);

  async function lookupMatch(phoneToLookup: string) {
    setStatus('loading');
    const res = await fetch(`/api/match/${eventId}?phone=${encodeURIComponent(phoneToLookup)}`);
    if (res.ok) {
      setResult(await res.json());
      setStatus('found');
    } else {
      setStatus('not-found');
    }
  }

  useEffect(() => {
    const phoneToUse = initialPhone ?? loadIdentity()?.phoneNumber;
    if (!phoneToUse) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPhone(phoneToUse);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void lookupMatch(phoneToUse);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPhone]);

  return (
    <main className="app-shell-centered">
      <div className="app-container-narrow page-stack">
        <Link href={`/events/${eventId}`} className="app-backlink">
          ← Back to Event
        </Link>

        <div className="glass-panel panel-pad-lg text-center">
          {status === 'idle' && (
            <>
              <div className="text-4xl mb-3">✨</div>
              <h1 className="section-title text-xl">Find your match</h1>
              <div className="stack-sm mt-4">
                <input
                  type="tel"
                  placeholder="Enter the phone number you registered with"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="tp-input text-center"
                />
                <button
                  onClick={() => phone && lookupMatch(phone)}
                  className="tp-btn-primary w-full"
                >
                  Reveal my match
                </button>
              </div>
            </>
          )}

          {status === 'loading' && (
            <div className="py-10">
              <div className="text-4xl animate-pulse">💫</div>
              <p className="tp-muted mt-3">Finding your match...</p>
            </div>
          )}

          {status === 'not-found' && (
            <div className="py-6">
              <div className="text-4xl mb-3">⏳</div>
              <p className="text-[#e0f8eb] font-medium">No match yet.</p>
              <p className="text-sm tp-muted">
                The organizer runs matching shortly before the event — check back soon.
              </p>
              <button
                onClick={() => setStatus('idle')}
                className="mt-4 text-sm font-semibold text-[#d8ffca]"
              >
                Try another number
              </button>
            </div>
          )}

          {status === 'found' && result && (
            <div>
              <div className="text-5xl mb-3">🤝</div>
              <p className="text-xs font-semibold text-[#d8ffca] uppercase tracking-wide mb-1">
                You&apos;ve been matched
              </p>
              <h1 className="section-title text-2xl">{result.partnerName}</h1>

              {result.partnerInterests.length > 0 && (
                <div className="row-wrap justify-center mt-4 mb-4">
                  {result.partnerInterests.map((interest) => (
                    <span
                      key={interest}
                      className="tp-chip"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              )}

              <div className="soft-note">
                <p className="text-xs font-semibold tp-muted mb-1">Icebreaker</p>
                <p className="text-[#effff6] font-medium">&ldquo;{result.icebreaker}&rdquo;</p>
              </div>

              <p className="text-xs tp-muted mt-4">
                Look for someone at the event — say hi and ask away!
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
