'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

type EventFormValues = {
  name: string;
  description: string;
  location: string;
  category: string;
};

export default function EventForm({
  eventId,
  initialValues,
}: {
  eventId?: string;
  initialValues?: EventFormValues;
}) {
  const router = useRouter();
  const [values, setValues] = useState<EventFormValues>(
    initialValues ?? { name: '', description: '', location: '', category: 'TECH' }
  );
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');

  const isEditing = Boolean(eventId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');

    const res = await fetch(isEditing ? `/api/admin/events/${eventId}` : '/api/admin/events', {
      method: isEditing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });

    if (res.ok) {
      router.push('/admin');
      router.refresh();
    } else {
      setStatus('error');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="stack-sm">
      <input
        type="text"
        required
        placeholder="Event name"
        value={values.name}
        onChange={(e) => setValues({ ...values, name: e.target.value })}
        className="tp-input"
      />
      <textarea
        placeholder="Description"
        value={values.description}
        onChange={(e) => setValues({ ...values, description: e.target.value })}
        rows={3}
        className="tp-textarea"
      />
      <input
        type="text"
        placeholder="Location"
        value={values.location}
        onChange={(e) => setValues({ ...values, location: e.target.value })}
        className="tp-input"
      />
      <select
        value={values.category}
        onChange={(e) => setValues({ ...values, category: e.target.value })}
        className="tp-select"
      >
        <option value="TECH">Tech</option>
        <option value="AI">AI</option>
      </select>

      <button type="submit" disabled={status === 'loading'} className="tp-btn-primary w-full">
        {status === 'loading' ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Event'}
      </button>
      {status === 'error' && (
        <p className="text-sm tp-danger text-center">Something went wrong. Try again.</p>
      )}
    </form>
  );
}
