import Link from "next/link";

const STEPS = [
  {
    number: "01",
    title: "Register & opt in",
    desc: "Share what you care about and choose to be matched at the event.",
  },
  {
    number: "02",
    title: "Get matched",
    desc: "We pair you with someone compatible and send a smart conversation starter.",
  },
  {
    number: "03",
    title: "Meet & keep talking",
    desc: "Connect in person, then keep the momentum alive in event chat.",
  },
];

export default function WelcomePage() {
  return (
    <main className="landing-shell">
      <div className="landing-noise" aria-hidden="true" />
      <div className="landing-orb landing-orb-left" aria-hidden="true" />
      <div className="landing-orb landing-orb-right" aria-hidden="true" />

      <section className="hero-wrap">
        {/* <p className="hero-kicker">Live events with real chemistry</p> */}
        <h1 className="hero-title">
          Radar turns awkward intros into <span>actual conversations</span>.
        </h1>
        <p className="hero-copy">
          Discover curated events, get matched with attendees who share your interests, and walk in
          with a conversation already started.
        </p>

        <div className="hero-actions">
          <Link href="/events" className="cta cta-primary">
            Explore events
          </Link>
          <Link href="/login" className="cta cta-secondary">
            Sign in
          </Link>
        </div>

        <div className="stats-grid" role="list" aria-label="Platform stats">
          <article className="stat-card" role="listitem">
            <p className="stat-value">12k+</p>
            <p className="stat-label">attendees connected</p>
          </article>
          <article className="stat-card" role="listitem">
            <p className="stat-value">84%</p>
            <p className="stat-label">reported better networking</p>
          </article>
          <article className="stat-card" role="listitem">
            <p className="stat-value">220+</p>
            <p className="stat-label">events powered monthly</p>
          </article>
        </div>
      </section>

      <section className="steps-wrap" aria-labelledby="how-it-works">
        <div className="section-head">
          <p className="section-eyebrow">How it works</p>
          <h2 id="how-it-works">Three simple moves before you even arrive</h2>
        </div>

        <div className="steps-grid">
          {STEPS.map((step) => (
            <article className="step-card" key={step.title}>
              <p className="step-number">{step.number}</p>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* <section className="status-wrap" aria-label="System status">
        <div className="status-left">
          <p className="status-label">Active endpoint</p>
          <p className="status-value">/api/sms</p>
        </div>
        <p className="status-right">
          Status <span>Operational</span>
        </p>
      </section> */}
    </main>
  );
}
