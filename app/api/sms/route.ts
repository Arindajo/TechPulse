import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '../lib/supabase/client';

export async function POST(req: NextRequest) {
  const supabase = getSupabase();
  
  const formData = await req.formData();
  const text = formData.get('text')?.toString().trim().toUpperCase() || "";

  if (!text.startsWith("YES")) {
    return new NextResponse('<Response><SMS>Invalid format. Reply YES[ID].</SMS></Response>', { 
      headers: {'Content-Type': 'application/xml'} 
    });
  }

  const matchId = text.replace("YES", "").trim();

  // Fetch match and join details
  const { data: match, error } = await supabase
    .from('matches')
    .select(`
      id,
      sender:users!matches_sender_phone_fkey(username, phone_number),
      receiver:users!matches_receiver_phone_fkey(username, phone_number),
      event:events(name)
    `)
    .eq('id', matchId)
    .single();

  if (error || !match) {
    return new NextResponse('<Response><SMS>Match not found.</SMS></Response>', { 
      headers: {'Content-Type': 'application/xml'} 
    });
  }

  // FIX: Explicitly handle the joined data as single objects for TypeScript
  // We use Array.isArray to safely check if the data is wrapped in an array
  const sender = Array.isArray(match.sender) ? match.sender[0] : match.sender;
  const receiver = Array.isArray(match.receiver) ? match.receiver[0] : match.receiver;
  const event = Array.isArray(match.event) ? match.event[0] : match.event;

  // Update status in Database
  await supabase.from('matches').update({ status: 'accepted' }).eq('id', matchId);

  // Use the extracted objects for your message
  const profileMsg = `Connected! ${sender?.username || 'Sender'} meet ${receiver?.username || 'Receiver'}. You are now linked for ${event?.name || 'the event'}.`;
  
  // Send follow-up profile SMS via Africa's Talking API
  await fetch("https://api.africastalking.com/version1/messaging", {
    method: "POST",
    headers: { 
      "apiKey": process.env.AT_API_KEY!, 
      "Content-Type": "application/x-www-form-urlencoded",
      "Accept": "application/json"
    },
    body: new URLSearchParams({
      username: process.env.AT_USERNAME!,
      to: `${sender?.phone_number},${receiver?.phone_number}`,
      message: profileMsg
    })
  });

  return new NextResponse(`<Response><SMS>Success! You are connected. Check your phone for details.</SMS></Response>`, { 
    headers: {'Content-Type': 'application/xml'} 
  });
}