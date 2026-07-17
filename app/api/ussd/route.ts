import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase (This is fine at the top)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  // Move the AfricasTalking initialization INSIDE the function
  const AfricasTalking = require('africastalking')({
    apiKey: process.env.AT_API_KEY!,
    username: process.env.AT_USERNAME!
  });

  const formData = await req.formData();
  
  const text = formData.get('text')?.toString() || "";
  const phoneNumber = formData.get('phoneNumber')?.toString() || "";

  let response = "";

  // MENU 1: Main Categories
  if (text === "") {
    response = "CON Welcome to TechPulse\n1. View Tech Events\n2. View AI Events";
  } 

  // MENU 2: Show Events from Database
  else if (text === "1" || text === "2") {
    const category = text === "1" ? "TECH" : "AI";
    
    const { data: events, error } = await supabase
      .from('events')
      .select('id, name')
      .eq('category', category);

    if (error || !events || events.length === 0) {
      response = "END No events found.";
    } else {
      response = "CON Select event:\n" + events.map((e, i) => `${i + 1}. ${e.name}`).join("\n");
    }
  } 

  // MENU 3: Register User
  else if (text.startsWith("1*") || text.startsWith("2*")) {
    // This logic assumes user selected the first option for demo purposes
    // In a production app, you would parse the specific selection index here
    const eventId = 1; 

    const { error } = await supabase
      .from('registrations')
      .insert([{ phone_number: phoneNumber, event_id: eventId }]);

    if (error) {
      response = "END Registration failed.";
    } else {
      await AfricasTalking.SMS.send({
        to: [phoneNumber],
        message: "You are registered for the event!",
        from: '1517'
      });
      response = "END Registration successful!";
    }
  }

  return new NextResponse(response, { status: 200, headers: { 'Content-Type': 'text/plain' } });
}