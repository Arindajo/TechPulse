import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  const AfricasTalking = require('africastalking')({
    apiKey: process.env.AT_API_KEY!,
    username: process.env.AT_USERNAME!
  });

  const formData = await req.formData();
  const text = formData.get('text')?.toString() || "";
  const phoneNumber = formData.get('phoneNumber')?.toString() || "";
  const parts = text.split('*');
  let response = "";

  // 1. MAIN MENU
  if (text === "") {
    response = "CON Welcome to TechPulse\n1. View Tech Events\n2. View AI Events";
  }

  // 2. LIST EVENTS (e.g., "1" or "2")
  else if (parts.length === 1) {
    const category = parts[0] === "1" ? "TECH" : "AI";
    const { data: events } = await supabase.from('events').select('id, name').ilike('category', category);

    if (!events || events.length === 0) {
      response = "END No events found for " + category;
    } else {
      // Store IDs in a way we can reference later (index + 1)
      response = "CON Select event:\n" + events.map((e, i) => `${i + 1}. ${e.name}`).join("\n");
    }
  }

  // 3. SHOW EVENT DETAILS (e.g., "1*1")
  else if (parts.length === 2) {
    const category = parts[0] === "1" ? "TECH" : "AI";
    const selectedIdx = parseInt(parts[1]) - 1;
    const { data: events } = await supabase.from('events').select('*').ilike('category', category);

    if (events && events[selectedIdx]) {
      const e = events[selectedIdx];
      response = `CON ${e.name}\n${e.description}\nTime: ${e.time}\nLoc: ${e.location}\n1. Register\n0. Back`;
    } else {
      response = "END Event not found.";
    }
  }

  // 4. REGISTER & SEND SMS (e.g., "1*1*1")
  else if (parts.length === 3 && parts[2] === "1") {
    const category = parts[0] === "1" ? "TECH" : "AI";
    const selectedIdx = parseInt(parts[1]) - 1;
    const { data: events } = await supabase.from('events').select('*').ilike('category', category);
    const e = events?.[selectedIdx];

    if (e) {
      const { error } = await supabase.from('registrations').insert([{ phone_number: phoneNumber, event_id: e.id }]);
      
      if (!error) {
        try {
          await AfricasTalking.SMS.send({
            to: [phoneNumber],
            message: `Confirmed: You are registered for ${e.name}. Details: ${e.description}. Speakers: ${e.speakers}.`,
            from: '70889' 
          });
          response = "END Registration successful! Check your SMS for details.";
        } catch (smsError) {
          console.error("SMS Error:", smsError);
          response = "END Registered, but SMS failed to send.";
        }
      } else {
        response = "END Registration failed.";
      }
    }
  }

  return new NextResponse(response, { status: 200, headers: { 'Content-Type': 'text/plain' } });
}