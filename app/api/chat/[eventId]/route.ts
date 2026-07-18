import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Fetch the message history for an event's chat
export async function GET(req: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;

  const { data: messages, error } = await supabase
    .from('chat_messages')
    .select('id, name, message, created_at')
    .eq('event_id', eventId)
    .order('created_at', { ascending: true })
    .limit(200);

  if (error) {
    return NextResponse.json({ error: 'Could not load messages' }, { status: 500 });
  }

  return NextResponse.json({ messages });
}

// Post a new message, only allowed for attendees who consented to the chat
export async function POST(req: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  try {
    const { eventId } = await params;
    const { phoneNumber, name, message } = await req.json();

    if (!phoneNumber || !name || !message?.trim()) {
      return NextResponse.json({ error: 'Missing phoneNumber, name, or message' }, { status: 400 });
    }

    const { data: registration } = await supabase
      .from('registrations')
      .select('opt_in_chat')
      .eq('event_id', eventId)
      .eq('phone_number', phoneNumber)
      .single();

    if (!registration?.opt_in_chat) {
      return NextResponse.json({ error: 'You must consent to join the chat first' }, { status: 403 });
    }

    const { error } = await supabase
      .from('chat_messages')
      .insert([{ event_id: eventId, phone_number: phoneNumber, name, message: message.trim() }]);

    if (error) {
      return NextResponse.json({ error: 'Could not send message' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Chat Send Error:', err);
    return NextResponse.json({ error: 'System busy. Please try later.' }, { status: 500 });
  }
}
