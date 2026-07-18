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
    <main className="min-h-screen p-6 flex flex-col items-center">
      <h2 className="text-2xl font-bold text-[#c36b05] mb-2">Tailor Your Feed</h2>
      <p className="text-slate-500 mb-8 text-center">Select topics you love to get alerts.</p>
      
      <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
        {INTERESTS.map(i => (
          <button key={i} onClick={() => toggleInterest(i)} className={`p-4 rounded-2xl border-2 font-semibold transition ${selected.includes(i) ? 'border-[#c36b05] bg-[#c36b05] text-white' : 'bg-white border-slate-200'}`}>
            {i}
          </button>
        ))}
      </div>
      
      <button onClick={saveInterests} className="mt-8 w-full max-w-sm bg-[#c36b05] text-white py-4 rounded-xl font-bold">
        Complete Profile
      </button>
    </main>
  );
}