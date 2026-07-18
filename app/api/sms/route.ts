import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '../lib/supabase/client';

export async function POST(req: NextRequest) {
  const supabase = getSupabase();
  const formData = await req.formData();
  const text = formData.get('text')?.toString().trim().toUpperCase() || "";
  
  console.log("Incoming SMS Webhook Data:", Object.fromEntries(formData.entries()));

  if (!text.startsWith("YES")) {
    return new NextResponse('<Response><SMS>Invalid format. Reply YES[ID].</SMS></Response>', { 
      headers: {'Content-Type': 'application/xml'} 
    });
  }

  const matchId = text.replace("YES", "").trim();

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
    console.error("Match Fetch Error:", error);
    return new NextResponse('<Response><SMS>Match not found.</SMS></Response>', { 
      headers: {'Content-Type': 'application/xml'} 
    });
  }

  const sender = Array.isArray(match.sender) ? match.sender[0] : match.sender;
  const receiver = Array.isArray(match.receiver) ? match.receiver[0] : match.receiver;
  const event = Array.isArray(match.event) ? match.event[0] : match.event;

  await supabase.from('matches').update({ status: 'accepted' }).eq('id', matchId);

  const profileMsg = `Connected! ${sender?.username || 'Sender'} meet ${receiver?.username || 'Receiver'}. You are now linked for ${event?.name || 'the event'}.`;
  
  try {
    const atResponse = await fetch("https://api.africastalking.com/version1/messaging", {
      method: "POST",
      headers: { 
        "apiKey": process.env.AT_API_KEY!, 
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json"
      },
      body: new URLSearchParams({
        username: process.env.AT_USERNAME!,
        to: `${sender?.phone_number},${receiver?.phone_number}`,
        message: profileMsg,
        from: "70889" // Ensure this is a registered ID
      })
    });

    const atResult = await atResponse.json();
    console.log("AT API Response:", JSON.stringify(atResult));
  } catch (err) {
    console.error("Failed to send SMS:", err);
  }

  return new NextResponse(`<Response><SMS>Success! You are connected.</SMS></Response>`, { 
    headers: {'Content-Type': 'application/xml'} 
  });
}