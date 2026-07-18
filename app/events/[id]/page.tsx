import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import RegisterForm from './RegisterForm';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const CATEGORY_STYLES: Record<string, string> = {
  TECH: 'tp-chip',
  AI: 'tp-chip tp-chip-ai',
};

const CATEGORY_INTEREST_PREVIEW: Record<string, string[]> = {
  TECH: ['Web Dev', 'Cloud', 'Cybersecurity'],
  AI: ['Machine Learning', 'Data Science', 'Automation'],
};

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data: event } = await supabase.from('events').select('*').eq('id', id).single();

  // Show Next.js 404 page if the event doesn't exist
  if (!event) {
    notFound();
  }

  return (
    <main className="app-shell">
      <div className="app-container-narrow page-stack event-detail-page">
        <Link href="/events" className="app-backlink">
          ← Back to Events
        </Link>

        <section className="glass-panel panel-pad-lg event-detail-head stack-sm">
          <span className={CATEGORY_STYLES[event.category] ?? 'tp-chip'}>{event.category}</span>
          <h1 className="section-title">{event.name}</h1>
          <p className="event-detail-description">{event.description || 'No description yet.'}</p>

          <div className="event-detail-interests" aria-label="Interests in this event">
            {(CATEGORY_INTEREST_PREVIEW[event.category] ?? ['Networking', 'Tech Talks', 'Community']).map(
              (interest) => (
                <span key={interest} className="event-interest-pill">
                  {interest}
                </span>
              )
            )}
          </div>
        </section>

        <section className="glass-panel panel-pad event-detail-meta">
          <p className="event-detail-meta-label">Location</p>
          <p className="event-detail-meta-value">📍 {event.location}</p>
        </section>

        <section className="glass-panel panel-pad-lg stack-md">
          <h2 className="event-detail-form-title">Save your seat</h2>
          <RegisterForm eventId={event.id} />
        </section>
      </div>
    </main>
  );
}
