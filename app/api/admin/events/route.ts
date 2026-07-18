import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Create a new event
export async function POST(req: NextRequest) {
  try {
    const { name, description, location, category } = await req.json();
    if (!name || !category) {
      return NextResponse.json({ error: 'Missing name or category' }, { status: 400 });
    }

    const { error } = await supabase.from('events').insert([{ name, description, location, category }]);
    if (error) {
      return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Create Event Error:', err);
    return NextResponse.json({ error: 'System busy. Please try later.' }, { status: 500 });
  }
}
