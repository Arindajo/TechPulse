import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateIcebreaker } from '../lib/ai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Candidate = { phone_number: string; interests: string[] };

// Greedily pairs candidates by highest shared-interest count
function pairCandidates(candidates: Candidate[]): [Candidate, Candidate][] {
  const remaining = [...candidates];
  const pairs: [Candidate, Candidate][] = [];

  while (remaining.length > 1) {
    const person = remaining.shift()!;
    let bestIndex = 0;
    let bestScore = -1;

    remaining.forEach((other, index) => {
      const score = other.interests.filter((i) => person.interests.includes(i)).length;
      if (score > bestScore) {
        bestScore = score;
        bestIndex = index;
      }
    });

    const [match] = remaining.splice(bestIndex, 1);
    pairs.push([person, match]);
  }

  return pairs;
}

// Runs matching for every opted-in attendee of an event and stores the pairs + icebreakers
export async function POST(req: NextRequest) {
  try {
    const { eventId } = await req.json();
    if (!eventId) {
      return NextResponse.json({ error: 'Missing eventId' }, { status: 400 });
    }

    // 1. GET OPTED-IN ATTENDEES
    const { data: registrations } = await supabase
      .from('registrations')
      .select('phone_number')
      .eq('event_id', eventId)
      .eq('opt_in_matching', true);

    if (!registrations || registrations.length < 2) {
      return NextResponse.json({ error: 'Not enough opted-in attendees to match yet' }, { status: 400 });
    }

    const phoneNumbers = [...new Set(registrations.map((r) => r.phone_number))];
    const { data: users } = await supabase
      .from('users')
      .select('phone_number, interests')
      .in('phone_number', phoneNumbers);

    const candidates: Candidate[] = phoneNumbers.map((phone) => ({
      phone_number: phone,
      interests: users?.find((u) => u.phone_number === phone)?.interests ?? [],
    }));

    // 2. CLEAR ANY PREVIOUS MATCHES FOR THIS EVENT
    await supabase.from('matches').delete().eq('event_id', eventId);

    // 3. PAIR PEOPLE UP AND GENERATE ICEBREAKERS
    const pairs = pairCandidates(candidates);
    const rows = await Promise.all(
      pairs.map(async ([a, b]) => ({
        event_id: eventId,
        phone_a: a.phone_number,
        phone_b: b.phone_number,
        icebreaker: await generateIcebreaker(a.interests, b.interests),
      }))
    );

    const { error } = await supabase.from('matches').insert(rows);
    if (error) {
      console.error('Matches Insert Error:', error);
      return NextResponse.json({ error: 'Failed to save matches' }, { status: 500 });
    }

    return NextResponse.json({ success: true, matched: rows.length * 2 });
  } catch (err) {
    console.error('Match Error:', err);
    return NextResponse.json({ error: 'System busy. Please try later.' }, { status: 500 });
  }
}
