import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '../lib/supabase/client';

export async function POST(req: NextRequest) {
  // Lazy-load Supabase inside the function
  const supabase = getSupabase();

  const formData = await req.formData();
  const text = formData.get('text')?.toString().trim().toUpperCase() || "";
  const from = formData.get('from')?.toString() || "";

  // Logic: User replies "YES123" to accept connection request 123
  if (text.startsWith("YES")) {
    const connectionId = text.replace("YES", "");
    
    // Update connection to accepted
    const { data: conn } = await supabase.from('connections')
      .update({ status: 'accepted' })
      .eq('id', connectionId)
      .select('sender_phone, receiver_phone')
      .single();

    if (conn) {
      // Reveal numbers to each other (The "Connection Broker")
      const AfricasTalking = require('africastalking')({ 
        apiKey: process.env.AT_API_KEY!, 
        username: process.env.AT_USERNAME! 
      });
      await AfricasTalking.SMS.send({ 
        to: [conn.sender_phone, conn.receiver_phone], 
        message: "Connected! You can now contact each other." 
      });
    }
    
    return new NextResponse('<Response><SMS>Connection confirmed!</SMS></Response>', { 
      headers: {'Content-Type': 'application/xml'}
    });
  }

  return new NextResponse('<Response><SMS>Invalid reply.</SMS></Response>', { 
    headers: {'Content-Type': 'application/xml'}
  });
}