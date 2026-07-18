import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import DeleteEventButton from './DeleteEventButton';
import RunMatchingButton from './RunMatchingButton';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function AdminPage() {
  const { data: events } = await supabase
    .from('events')
    .select('id, name, category, location')
    .order('id', { ascending: false });

  const { data: registrations } = await supabase.from('registrations').select('event_id');

  // Count registrations per event for the stats column
  const registrationCounts: Record<string, number> = {};
  for (const r of registrations ?? []) {
    registrationCounts[r.event_id] = (registrationCounts[r.event_id] ?? 0) + 1;
  }

  return (
    <main className="app-shell">
      <div className="app-container page-stack">
        <div className="page-header">
          <div className="page-header-block">
            <p className="page-eyebrow">Admin</p>
            <h1 className="section-title">Dashboard</h1>
          </div>
          <Link href="/admin/new" className="tp-btn-primary text-sm">
            + New Event
          </Link>
        </div>

        <div className="grid-2">
          <div className="glass-panel panel-pad">
            <p className="text-xs font-medium tp-muted">Total Events</p>
            <p className="text-2xl font-extrabold">{events?.length ?? 0}</p>
          </div>
          <div className="glass-panel panel-pad">
            <p className="text-xs font-medium tp-muted">Total Registrations</p>
            <p className="text-2xl font-extrabold">{registrations?.length ?? 0}</p>
          </div>
        </div>

        <div className="stack-sm">
          {events && events.length > 0 ? (
            events.map((event) => (
              <div
                key={event.id}
                className="glass-panel panel-pad flex items-center justify-between gap-3"
              >
                <div>
                  <p className="text-xs font-semibold text-[#d8ffca] mb-1">{event.category}</p>
                  <h2 className="text-lg font-bold">{event.name}</h2>
                  <p className="text-sm tp-muted">{event.location}</p>
                  <p className="text-xs tp-muted mt-1">
                    {registrationCounts[event.id] ?? 0} registered
                  </p>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <Link
                    href={`/admin/${event.id}/edit`}
                    className="text-sm font-medium text-[#d8ffca] text-center"
                  >
                    Edit
                  </Link>
                  <DeleteEventButton eventId={event.id} />
                  <RunMatchingButton eventId={event.id} />
                </div>
              </div>
            ))
          ) : (
            <p className="text-center tp-muted py-8">No events yet.</p>
          )}
        </div>
      </div>
    </main>
  );
}
