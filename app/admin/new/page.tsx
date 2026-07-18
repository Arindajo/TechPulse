import Link from 'next/link';
import EventForm from '../EventForm';

export default function NewEventPage() {
  return (
    <main className="app-shell">
      <div className="app-container-narrow page-stack">
        <Link href="/admin" className="app-backlink">
          ← Back to Dashboard
        </Link>

        <div className="glass-panel panel-pad-lg stack-sm">
          <h1 className="section-title text-xl">New event</h1>
          <EventForm />
        </div>
      </div>
    </main>
  );
}
