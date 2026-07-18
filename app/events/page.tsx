import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

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

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;

  // Filter by category if one is selected in the URL
  let query = supabase.from('events').select('id, name, description, location, category');
  if (category) {
    query = query.ilike('category', category);
  }
  const { data: events } = await query;

  const filters = [
    { label: 'All', value: undefined },
    { label: 'Tech', value: 'TECH' },
    { label: 'AI', value: 'AI' },
  ];

  return (
    <main className="app-shell">
      <div className="app-container-wide events-page">
        <section className="glass-panel events-hero">
          <div className="page-header-block">
            <p className="events-kicker">Explore events</p>
            <h1 className="section-title">Your next great conversation starts here</h1>
            <p className="section-subtitle">
              Browse upcoming rooms and pick the event that matches your interests and energy.
            </p>

            <div className="events-filters" role="tablist" aria-label="Filter by category">
              {filters.map((f) => (
                <Link
                  key={f.label}
                  href={f.value ? `/events?category=${f.value}` : '/events'}
                  className={`events-filter ${
                    category === f.value || (!category && !f.value) ? 'events-filter-active' : ''
                  }`}
                >
                  {f.label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="events-grid" aria-label="Event results">
          {events && events.length > 0 ? (
            events.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="event-card"
              >
                <div className="event-card-top">
                  <span className={CATEGORY_STYLES[event.category] ?? 'tp-chip'}>{event.category}</span>
                  <span className="event-card-arrow">View</span>
                </div>

                <h2 className="event-card-title">{event.name}</h2>
                <p className="event-card-description">{event.description || 'No description yet.'}</p>

                <div className="event-card-interests" aria-label="Interest preview">
                  {(CATEGORY_INTEREST_PREVIEW[event.category] ?? ['Networking', 'Tech Talks', 'Community']).map(
                    (interest) => (
                      <span key={`${event.id}-${interest}`} className="event-interest-pill">
                        {interest}
                      </span>
                    )
                  )}
                </div>

                <p className="event-card-location">{event.location}</p>
              </Link>
            ))
          ) : (
            <div className="glass-panel events-empty">
              <p className="events-empty-title">No events found</p>
              <p className="tp-muted">Try another category or check back later.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
