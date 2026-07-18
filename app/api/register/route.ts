import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const AfricasTalking = require('africastalking')({
    apiKey: process.env.AT_API_KEY!,
    username: process.env.AT_USERNAME!
  });

  try {
    // 1. VALIDATE INPUT
    const { eventId, phoneNumber, name, interests, optInMatching } = await req.json();
    if (!eventId || !phoneNumber || !name) {
      return NextResponse.json({ error: 'Missing eventId, phoneNumber, or name' }, { status: 400 });
    }

    // 2. LOOK UP EVENT
    const { data: event } = await supabase.from('events').select('name').eq('id', eventId).single();
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // 3. SAVE NAME + INTERESTS ON THE USER PROFILE
    const { error: userError } = await supabase
      .from('users')
      .upsert(
        { phone_number: phoneNumber, name, interests: interests ?? [] },
        { onConflict: 'phone_number' }
      );
    if (userError) {
      console.error('User Upsert Error:', userError);
      return NextResponse.json({ error: 'Could not save profile' }, { status: 500 });
    }

    // 4. SAVE REGISTRATION
    const { error } = await supabase
      .from('registrations')
      .insert([{ phone_number: phoneNumber, event_id: eventId, opt_in_matching: Boolean(optInMatching) }]);
    if (error) {
      console.error('Registration Insert Error:', error);
      return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
    }

    // 5. SEND SMS CONFIRMATION (best-effort — don't fail registration if SMS fails)
    const smsPhone = phoneNumber.startsWith('0') ? `+256${phoneNumber.slice(1)}` : phoneNumber;
    try {
      await AfricasTalking.SMS.send({
        to: [smsPhone],
        message: `Confirmed: Registered for ${event.name}.`,
        from: '70889',
      });
    } catch (smsErr) {
      console.error('SMS Send Error:', smsErr);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Register Error:', err);
    return NextResponse.json({ error: 'System busy. Please try later.' }, { status: 500 });
  }
}
