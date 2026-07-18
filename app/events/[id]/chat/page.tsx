'use client';

import { useState, useEffect, useRef, use } from 'react';
import Link from 'next/link';
import { loadIdentity } from '../../../lib/identity';

type ChatMessage = {
  id: string;
  name: string;
  message: string;
  created_at: string;
};

export default function ChatPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ phone?: string; name?: string }>;
}) {
  const { id: eventId } = use(params);
  const { phone: initialPhone, name: initialName } = use(searchParams);
  const saved = initialPhone && initialName ? null : loadIdentity();

  const [phone, setPhone] = useState(initialPhone ?? saved?.phoneNumber ?? '');
  const [name, setName] = useState(initialName ?? saved?.name ?? '');
  const [consented, setConsented] = useState(false);
  const [stage, setStage] = useState<'identify' | 'consent' | 'chat'>(
    (initialPhone && initialName) || (saved?.phoneNumber && saved?.name) ? 'consent' : 'identify'
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function joinChat() {
    const res = await fetch('/api/chat/consent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId, phoneNumber: phone }),
    });
    if (res.ok) {
      setConsented(true);
      setStage('chat');
    }
  }

  async function loadMessages() {
    const res = await fetch(`/api/chat/${eventId}`);
    if (res.ok) {
      const body = await res.json();
      setMessages(body.messages ?? []);
    }
  }

  useEffect(() => {
    if (stage !== 'chat') return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadMessages();
    const interval = setInterval(() => void loadMessages(), 3000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    setSending(true);
    const res = await fetch(`/api/chat/${eventId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber: phone, name, message: draft }),
    });
    if (res.ok) {
      setDraft('');
      await loadMessages();
    }
    setSending(false);
  }

  return (
    <main className="app-shell flex flex-col">
      <div className="app-container-narrow w-full flex flex-col flex-1 page-stack">
        <Link href={`/events/${eventId}`} className="app-backlink">
          ← Back to Event
        </Link>

        {stage === 'identify' && (
          <div className="glass-panel panel-pad-lg stack-sm">
            <div className="text-3xl mb-2">💬</div>
            <h1 className="section-title">Join the event chat</h1>
            <div className="stack-sm">
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="tp-input"
              />
              <input
                type="tel"
                placeholder="Phone number used to register"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="tp-input"
              />
              <button
                onClick={() => name && phone && setStage('consent')}
                className="tp-btn-primary w-full"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {stage === 'consent' && (
          <div className="glass-panel panel-pad-lg stack-sm">
            <div className="text-3xl mb-2">🤝</div>
            <h1 className="section-title text-xl">Before you join</h1>
            <p className="text-sm tp-muted">
              This chat is visible to everyone registered for this event. By joining, you agree to
              be respectful, keep it relevant to the event, and understand your name will be shown
              next to your messages.
            </p>
            <label className="flex items-start gap-3 bg-[#95ff7d]/10 border border-[#95ff7d]/30 rounded-2xl p-3 mb-4 cursor-pointer">
              <input
                type="checkbox"
                checked={consented}
                onChange={(e) => setConsented(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-[#9dff7e]"
              />
              <span className="text-sm text-[#d7efe2]">I agree to join the event chat respectfully.</span>
            </label>
            <button
              onClick={joinChat}
              disabled={!consented}
              className="tp-btn-primary w-full"
            >
              Join chat
            </button>
          </div>
        )}

        {stage === 'chat' && (
          <div className="flex flex-col flex-1 glass-panel border overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10 bg-[#95ff7d]/10">
              <p className="text-sm font-semibold text-[#dbffce]">Event chat</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 min-h-[50vh] max-h-[60vh]">
              {messages.length === 0 && (
                <p className="text-center tp-muted text-sm py-8">
                  No messages yet — say hi 👋
                </p>
              )}
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${
                    m.name === name
                      ? 'self-end bg-[#9dff7e] text-[#0d2c1a]'
                      : 'self-start bg-white/10 text-[#effff6]'
                  }`}
                >
                  {m.name !== name && (
                    <p className="text-xs font-semibold text-[#d9ffcd] mb-0.5">{m.name}</p>
                  )}
                  <p>{m.message}</p>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            <form onSubmit={handleSend} className="flex gap-2 p-3 border-t border-white/10">
              <input
                type="text"
                placeholder="Type a message..."
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="tp-input flex-1 rounded-full"
              />
              <button
                type="submit"
                disabled={sending || !draft.trim()}
                className="tp-btn-primary px-5"
              >
                Send
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
