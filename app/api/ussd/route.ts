import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

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
      response = "CON Welcome to TechPulse\n1. View Tech Events\n2. View AI Events\n3. Update Interests\n4. Set Username\n5. Check-in & Match";
    }

    // 4. SET USERNAME
    else if (parts[0] === "4") {
      if (parts.length === 1) response = "CON Enter your username:";
      else {
        await supabase.from('users').upsert({ phone_number: phoneNumber, username: parts[1] });
        response = "END Username saved as " + parts[1];
      }
    }

    // 5. CHECK-IN & MATCHING (Gemini Integration)
    else if (parts[0] === "5") {
      await supabase.from('registrations').update({ checked_in: true }).eq('phone_number', phoneNumber);
      
      const { data: user } = await supabase.from('users').select('username, interests').eq('phone_number', phoneNumber).single();
      const { data: match } = await supabase.from('users').select('username').neq('phone_number', phoneNumber).limit(1).single();

      if (match) {
       const aiResult = await ai.models.generateContent({
  model: "gemini-2.0-flash", // Using the latest recommended stable model
  contents: `Write a 15-word icebreaker for ${user?.username} to meet ${match.username} who likes ${user?.interests?.join(', ') || 'tech'}`
});

const icebreaker = aiResult.text;
        
        await AfricasTalking.SMS.send({ to: [phoneNumber], message: `Match found: ${match.username}! Icebreaker: ${icebreaker}`, from: '70889' });
        response = "END Checked in! You have a match. Check your SMS.";
      } else {
        response = "END Checked in! No matches found yet.";
      }
    }

    // 2. INTERESTS MENU
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
          await supabase.from('users').upsert({ phone_number: phoneNumber, interests: [...currentInterests, selected] });
        }
        response = "CON Added " + selected + "! Select another or 0 to Finish.";
      }
    }

    // 3. FREE TEXT SEARCH
    else if (parts.length === 1 && !["1", "2", "3", "4", "5"].includes(parts[0])) {
      const query = parts[0];
      const { data: events } = await supabase.from('events').select('id, name').or(`name.ilike.%${query}%,location.ilike.%${query}%`);
      response = (events && events.length > 0) ? "CON Found:\n" + events.map((e, i) => `${i + 1}. ${e.name}`).join("\n") : "END No events found.";
    }

    // 4. LIST EVENTS
    else if (parts.length === 1 && (parts[0] === "1" || parts[0] === "2")) {
      const category = parts[0] === "1" ? "TECH" : "AI";
      const { data: events } = await supabase.from('events').select('id, name').ilike('category', category);
      response = (!events || events.length === 0) ? "END No events found." : "CON Select event:\n" + events.map((e, i) => `${i + 1}. ${e.name}`).join("\n");
    }

    // 5. SHOW EVENT DETAILS
    else if (parts.length === 2 && (parts[0] === "1" || parts[0] === "2")) {
      const category = parts[0] === "1" ? "TECH" : "AI";
      const idx = parseInt(parts[1]) - 1;
      const { data: events } = await supabase.from('events').select('*').ilike('category', category);
      response = (events && events[idx]) ? `CON ${events[idx].name}\n${events[idx].description}\n1. Register\n0. Back` : "END Event not found.";
    }

    // 6. REGISTER FOR EVENT
    else if (parts.length === 3 && parts[2] === "1") {
      const category = parts[0] === "1" ? "TECH" : "AI";
      const idx = parseInt(parts[1]) - 1;
      const { data: events } = await supabase.from('events').select('*').ilike('category', category);
      if (events && events[idx]) {
        await supabase.from('registrations').insert([{ phone_number: phoneNumber, event_id: events[idx].id }]);
        await AfricasTalking.SMS.send({ to: [phoneNumber], message: `Confirmed: Registered for ${events[idx].name}.`, from: '70889' });
        response = "END Registration successful!";
      }
    }

    else { response = "END Invalid selection."; }

  } catch (err) {
    console.error("USSD Error:", err);
    response = "END System busy.";
  }

  return new NextResponse(response, { status: 200, headers: { 'Content-Type': 'text/plain' } });
}