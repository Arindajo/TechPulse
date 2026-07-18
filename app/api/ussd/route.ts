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

  try {
    // 1. MAIN MENU
    if (text === "") {
      response = "CON Welcome to TechPulse\n1. View Tech Events\n2. View AI Events\n3. Update Interests\nOr type a location/keyword to search:";
    }

    // 2. INTERESTS MENU (Option 3)
    else if (parts[0] === "3") {
      if (parts.length === 1) {
        response = "CON Select interest to add:\n1. AI\n2. Cybersecurity\n3. Data Analysis\n0. Finish";
      } else if (parts[1] === "0") {
        response = "END Interests saved successfully!";
      } else if (["1", "2", "3"].includes(parts[1])) {
        const interestMap: { [key: string]: string } = { "1": "AI", "2": "Cybersecurity", "3": "Data Analysis" };
        const selected = interestMap[parts[1]];
        
        const { data: existingUser } = await supabase.from('users').select('interests').eq('phone_number', phoneNumber).single();
        const currentInterests = existingUser?.interests || [];
        
        if (!currentInterests.includes(selected)) {
          await supabase.from('users').upsert({ 
            phone_number: phoneNumber, 
            interests: [...currentInterests, selected] 
          });
        }
        response = "CON Added " + selected + "! Select another or 0 to Finish.";
      }
    }

    // 3. FREE TEXT SEARCH (If input is not a menu option)
    else if (parts.length === 1 && !["1", "2", "3"].includes(parts[0])) {
      const query = parts[0];
      const { data: events } = await supabase.from('events')
        .select('id, name')
        .or(`name.ilike.%${query}%,location.ilike.%${query}%`);
      
      response = (events && events.length > 0) 
        ? "CON Found:\n" + events.map((e, i) => `${i + 1}. ${e.name}`).join("\n")
        : "END No events found for '" + query + "'. Try again later.";
    }

    // 4. LIST EVENTS (Category Selection: 1 or 2)
    else if (parts.length === 1 && (parts[0] === "1" || parts[0] === "2")) {
      const category = parts[0] === "1" ? "TECH" : "AI";
      const { data: events } = await supabase.from('events').select('id, name').ilike('category', category);

      response = (!events || events.length === 0) 
        ? "END No events found for " + category
        : "CON Select event:\n" + events.map((e, i) => `${i + 1}. ${e.name}`).join("\n");
    }

    // 5. SHOW EVENT DETAILS (e.g., 1*1)
    else if (parts.length === 2 && (parts[0] === "1" || parts[0] === "2")) {
      const category = parts[0] === "1" ? "TECH" : "AI";
      const idx = parseInt(parts[1]) - 1;
      const { data: events } = await supabase.from('events').select('*').ilike('category', category);

      response = (events && events[idx]) 
        ? `CON ${events[idx].name}\n${events[idx].description}\nLoc: ${events[idx].location}\n1. Register\n0. Back`
        : "END Event not found.";
    }

    // 6. REGISTER FOR EVENT (e.g., 1*1*1)
    else if (parts.length === 3 && parts[2] === "1") {
      const category = parts[0] === "1" ? "TECH" : "AI";
      const idx = parseInt(parts[1]) - 1;
      const { data: events } = await supabase.from('events').select('*').ilike('category', category);
      
      if (events && events[idx]) {
        const { error } = await supabase.from('registrations').insert([{ phone_number: phoneNumber, event_id: events[idx].id }]);
        if (!error) {
          await AfricasTalking.SMS.send({ to: [phoneNumber], message: `Confirmed: Registered for ${events[idx].name}.`, from: '70889' });
          response = "END Registration successful!";
        } else {
          response = "END Registration failed.";
        }
      }
    }

    else {
      response = "END Invalid selection. Please dial again.";
    }

  } catch (err) {
    console.error("USSD Error:", err);
    response = "END System busy. Please try later.";
  }

  return new NextResponse(response, { status: 200, headers: { 'Content-Type': 'text/plain' } });
}