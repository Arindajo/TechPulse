import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Looks up the match found for a given phone number at an event
export async function GET(req: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const phone = req.nextUrl.searchParams.get('phone');

  if (!phone) {
    return NextResponse.json({ error: 'Missing phone' }, { status: 400 });
  }

  const { data: match } = await supabase
    .from('matches')
    .select('phone_a, phone_b, icebreaker')
    .eq('event_id', eventId)
    .or(`phone_a.eq.${phone},phone_b.eq.${phone}`)
    .single();

  if (!match) {
    return NextResponse.json({ error: 'No match found yet' }, { status: 404 });
  }

  const partnerPhone = match.phone_a === phone ? match.phone_b : match.phone_a;
  const { data: partner } = await supabase
    .from('users')
    .select('name, interests')
    .eq('phone_number', partnerPhone)
    .single();

  return NextResponse.json({
    partnerName: partner?.name ?? 'Someone at the event',
    partnerInterests: partner?.interests ?? [],
    icebreaker: match.icebreaker,
  });
}
