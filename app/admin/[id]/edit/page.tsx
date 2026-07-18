import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import EventForm from '../../EventForm';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data: event } = await supabase
    .from('events')
    .select('name, description, location, category')
    .eq('id', id)
    .single();

  if (!event) {
    notFound();
  }

  return (
    <main className="app-shell">
      <div className="app-container-narrow page-stack">
        <Link href="/admin" className="app-backlink">
          ← Back to Dashboard
        </Link>

        <div className="glass-panel panel-pad-lg stack-sm">
          <h1 className="section-title text-xl">Edit event</h1>
          <EventForm
            eventId={id}
            initialValues={{
              name: event.name,
              description: event.description ?? '',
              location: event.location ?? '',
              category: event.category,
            }}
          />
        </div>
      </div>
    </main>
  );
}
