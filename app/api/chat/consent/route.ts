import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Marks a registered attendee as having consented to join the event chat
export async function POST(req: NextRequest) {
  try {
    const { eventId, phoneNumber } = await req.json();
    if (!eventId || !phoneNumber) {
      return NextResponse.json({ error: 'Missing eventId or phoneNumber' }, { status: 400 });
    }

    const { data: registration } = await supabase
      .from('registrations')
      .select('id')
      .eq('event_id', eventId)
      .eq('phone_number', phoneNumber)
      .single();

    if (!registration) {
      return NextResponse.json({ error: 'You must register for this event first' }, { status: 403 });
    }

    const { error } = await supabase
      .from('registrations')
      .update({ opt_in_chat: true })
      .eq('id', registration.id);

    if (error) {
      return NextResponse.json({ error: 'Could not join chat' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Chat Consent Error:', err);
    return NextResponse.json({ error: 'System busy. Please try later.' }, { status: 500 });
  }
}
