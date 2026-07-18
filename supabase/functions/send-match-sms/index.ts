import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface User {
  username: string;
  phone_number: string;
  interests: string[];
}

serve(async (req) => {
  // 1. Safely parse the request body
  let body;
  try {
    const text = await req.text();
    body = text ? JSON.parse(text) : {};
  } catch (e) {
    return new Response("Invalid JSON", { status: 400 });
  }

  const { record } = body;
  if (!record || !record.sender_phone || !record.receiver_phone) {
    return new Response("Missing record data", { status: 400 });
  }

  // 2. Initialize Supabase
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!, 
    Deno.env.get('SERVICE_ROLE_KEY')!
  );

  // 3. Fetch sender and receiver data
  const { data: sender } = await supabase
    .from('users')
    .select('username, phone_number')
    .eq('phone_number', record.sender_phone)
    .single() as { data: User | null };

  const { data: receiver } = await supabase
    .from('users')
    .select('username, interests')
    .eq('phone_number', record.receiver_phone)
    .single() as { data: User | null };

  if (!sender || !receiver) return new Response("User not found", { status: 404 });

  // 4. Call Gemini
  const aiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${Deno.env.get('GEMINI_API_KEY')}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      contents: [{ parts: [{ text: `Write a 15-word icebreaker for ${sender.username} to meet ${receiver.username} who likes ${receiver.interests?.join(', ') || 'tech'}` }] }] 
    })
  });
  
  const aiData = await aiResponse.json();
  const icebreaker = aiData.candidates?.[0]?.content?.parts?.[0]?.text || "Let's connect!";

  // 5. Send via Africa's Talking
  const atResponse = await fetch("https://api.africastalking.com/version1/messaging", {
    method: "POST",
    headers: { 
      "apiKey": Deno.env.get('AT_API_KEY')!, 
      "Content-Type": "application/x-www-form-urlencoded",
      "Accept": "application/json"
    },
    body: new URLSearchParams({
      username: Deno.env.get('AT_USERNAME')!,
      to: sender.phone_number,
      message: `Match found: ${receiver.username}! Icebreaker: ${icebreaker}. Reply YES${record.id} to connect.`
    })
  });

  return new Response(JSON.stringify({ status: "success" }), { 
    headers: { "Content-Type": "application/json" } 
  });
});