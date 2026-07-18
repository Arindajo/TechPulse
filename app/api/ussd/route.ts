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

  //  MAIN MENU
  if (text === "") {
    response = "CON Welcome to TechPulse\n1. View Tech Events\n2. View AI Events\n3. Update Interests";
  }

  //  LIST EVENTS (Category Selection)
  else if (parts.length === 1 && (parts[0] === "1" || parts[0] === "2")) {
    const category = parts[0] === "1" ? "TECH" : "AI";
    const { data: events } = await supabase.from('events').select('id, name').ilike('category', category);

    if (!events || events.length === 0) {
      response = "END No events found for " + category;
    } else {
      response = "CON Select event:\n" + events.map((e, i) => `${i + 1}. ${e.name}`).join("\n");
    }
  }

  //  SHOW EVENT DETAILS
  else if (parts.length === 2 && (parts[0] === "1" || parts[0] === "2")) {
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

  //  REGISTER FOR EVENT
  else if (parts.length === 3 && parts[2] === "1") {
    const category = parts[0] === "1" ? "TECH" : "AI";
    const selectedIdx = parseInt(parts[1]) - 1;
    const { data: events } = await supabase.from('events').select('*').ilike('category', category);
    const e = events?.[selectedIdx];

    if (e) {
      const { error } = await supabase.from('registrations').insert([{ phone_number: phoneNumber, event_id: e.id }]);
      if (!error) {
        await AfricasTalking.SMS.send({ to: [phoneNumber], message: `Confirmed: You are registered for ${e.name}.`, from: '70889' });
        response = "END Registration successful!";
      } else {
        response = "END Registration failed.";
      }
    }
  }

  //  INTERESTS MENU 
  else if (parts[0] === "3") {
    if (parts.length === 1) {
      response = "CON Select interest to add:\n1. AI\n2. Cybersecurity\n3. Data Analysis\n0. Save & Exit";
    } else if (parts.length === 2 && parts[1] === "0") {
      response = "END Interests updated!";
    } else if (parts.length === 2 && ["1", "2", "3"].includes(parts[1])) {
      const interestMap: { [key: string]: string } = { "1": "AI", "2": "Cybersecurity", "3": "Data Analysis" };
      const selectedInterest = interestMap[parts[1]];

      // Upsert user and add interest
      const { data: existingUser } = await supabase.from('users').select('interests').eq('phone_number', phoneNumber).single();
      const currentInterests = existingUser?.interests || [];
      
      if (!currentInterests.includes(selectedInterest)) {
        await supabase.from('users').upsert({ 
          phone_number: phoneNumber, 
          interests: [...currentInterests, selectedInterest] 
        });
      }
      response = "CON Added " + selectedInterest + "! Select more or 0 to Save.";
    }
  }

  return new NextResponse(response, { status: 200, headers: { 'Content-Type': 'text/plain' } });
}