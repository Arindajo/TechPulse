import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '../lib/supabase/client';

export async function POST(req: NextRequest) {
  const supabase = getSupabase();
  
  // Use formData() to parse Africa's Talking POST requests
  const formData = await req.formData();
  const text = formData.get('text')?.toString().trim().toUpperCase() || "";
  const phoneNumber = formData.get('from')?.toString() || "";

  if (text.startsWith("YES")) {
    const matchId = text.replace("YES", "").trim();

    // Fetch match with joined user and event details
    const { data: match, error } = await supabase
      .from('matches')
      .select(`
        id,
        sender:users!matches_sender_phone_fkey(username),
        receiver:users!matches_receiver_phone_fkey(username),
        event:events(name)
      `)
      .eq('id', matchId)
      .single();

    if (match && !error) {
      const senderName = match.sender?.username || "Sender";
      const receiverName = match.receiver?.username || "Receiver";
      const eventName = match.event?.name || "the event";

      // Update status in DB
      await supabase.from('matches').update({ status: 'accepted' }).eq('id', matchId);

      const message = `Success! ${senderName}, you are connected with ${receiverName} for ${eventName}. Enjoy!`;

      // Respond with XML for Africa's Talking
      return new NextResponse(`<Response><SMS>${message}</SMS></Response>`, { 
        headers: {'Content-Type': 'application/xml'} 
      });
    }
  }

  return new NextResponse('<Response><SMS>Invalid code or match not found.</SMS></Response>', { 
    headers: {'Content-Type': 'application/xml'} 
  });
}