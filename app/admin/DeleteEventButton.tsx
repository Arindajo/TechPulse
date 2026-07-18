'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function DeleteEventButton({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm('Delete this event? This cannot be undone.')) return;

    setLoading(true);
    const res = await fetch(`/api/admin/events/${eventId}`, { method: 'DELETE' });
    setLoading(false);

    if (res.ok) {
      router.refresh();
    } else {
      alert('Failed to delete event.');
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-sm font-medium text-[#ffabab] text-center disabled:opacity-50 hover:text-[#ffd0d0]"
    >
      {loading ? 'Deleting...' : 'Delete'}
    </button>
  );
}
