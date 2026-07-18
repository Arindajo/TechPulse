import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Looks up a returning attendee by phone number so they can log back in
export async function POST(req: NextRequest) {
  const { phoneNumber } = await req.json();
  if (!phoneNumber) {
    return NextResponse.json({ error: 'Missing phoneNumber' }, { status: 400 });
  }

  const { data: user } = await supabase
    .from('users')
    .select('name')
    .eq('phone_number', phoneNumber)
    .single();

  if (!user) {
    return NextResponse.json({ error: 'No account found with that phone number' }, { status: 404 });
  }

  return NextResponse.json({ name: user.name });
}
