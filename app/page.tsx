export default function WelcomePage() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif', textAlign: 'center' }}>
      <h1>Welcome to TechPulse</h1>
      <p>This is the central hub for our event management system.</p>
      
      <div style={{ marginTop: '2rem' }}>
        <p>Your API endpoint is active at:</p>
        <code style={{ background: '#f0f0f0', padding: '0.5rem', borderRadius: '4px' }}>
          /api/sms
        </code>
      </div>
    </main>
  );
}