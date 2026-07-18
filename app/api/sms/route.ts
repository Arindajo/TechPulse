import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '../lib/supabase/client';

export async function POST(req: NextRequest) {
  const supabase = getSupabase();
  
  // 1. Parse incoming Africa's Talking request
  const formData = await req.formData();
  const text = formData.get('text')?.toString().trim().toUpperCase() || "";
  const from = formData.get('from')?.toString() || "";

  if (!text.startsWith("YES")) {
    return new NextResponse('<Response><SMS>Invalid format. Reply YES[ID].</SMS></Response>', { 
      headers: {'Content-Type': 'application/xml'} 
    });
  }

  const matchId = text.replace("YES", "").trim();

  // 2. Fetch match and user details
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

  // 3. Update status in Database
  await supabase.from('matches').update({ status: 'accepted' }).eq('id', matchId);

  // 4. Send follow-up profile SMS via Africa's Talking API
  const profileMsg = `Connected! ${match.sender.username} meet ${match.receiver.username}. You are now linked for ${match.event?.name || 'the event'}.`;
  
  await fetch("https://api.africastalking.com/version1/messaging", {
    method: "POST",
    headers: { 
      "apiKey": process.env.AT_API_KEY!, 
      "Content-Type": "application/x-www-form-urlencoded",
      "Accept": "application/json"
    },
    body: new URLSearchParams({
      username: process.env.AT_USERNAME!,
      to: `${match.sender.phone_number},${match.receiver.phone_number}`,
      message: profileMsg
    })
  });

  // 5. Respond to the original "YES" SMS
  return new NextResponse(`<Response><SMS>Success! You are connected. Check your phone for details.</SMS></Response>`, { 
    headers: {'Content-Type': 'application/xml'} 
  });
}