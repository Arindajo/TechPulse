import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Update an existing event
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { name, description, location, category } = await req.json();
    if (!name || !category) {
      return NextResponse.json({ error: 'Missing name or category' }, { status: 400 });
    }

    const { error } = await supabase
      .from('events')
      .update({ name, description, location, category })
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Update Event Error:', err);
    return NextResponse.json({ error: 'System busy. Please try later.' }, { status: 500 });
  }
}

// Delete an event
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { error } = await supabase.from('events').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Delete Event Error:', err);
    return NextResponse.json({ error: 'System busy. Please try later.' }, { status: 500 });
  }
}
