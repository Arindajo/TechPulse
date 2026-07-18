"use client";
import { useState } from 'react';
import { getSupabase } from '../api/lib/supabase/client';

const INTERESTS = ['AI', 'Cybersecurity', 'Data Science', 'Cloud', 'Web Dev', 'Blockchain'];

export default function InterestPage() {
  const [selected, setSelected] = useState<string[]>([]);
  const supabase = getSupabase();
  const toggleInterest = (i: string) => {
    setSelected(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
  };

  const saveInterests = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('users').update({ interests: selected }).eq('id', user.id);
      window.location.href = '/dashboard';
    }
  };

  return (
    <main className="app-shell-centered">
      <section className="app-container-narrow glass-panel panel-pad-lg stack-md">
        <h2 className="section-title text-center">Tailor your feed</h2>
        <p className="section-subtitle text-center">Select topics you love to get alerts.</p>

        <div className="choice-grid w-full">
        {INTERESTS.map(i => (
          <button
            key={i}
            onClick={() => toggleInterest(i)}
            className={`choice-pill ${
              selected.includes(i)
                ? 'choice-pill-active'
                : ''
            }`}
          >
            {i}
          </button>
        ))}
        </div>

        <button onClick={saveInterests} className="mt-6 w-full tp-btn-primary">
          Complete profile
        </button>
      </section>
    </main>
  );
}