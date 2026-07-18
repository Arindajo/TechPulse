import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '../lib/supabase/client';

// Robust Helper function to send SMS
async function sendSMS(to: string, message: string) {
  // Ensure the phone number is in +256 format
  const sanitizedTo = to.startsWith('0') ? to.replace(/^0/, '+256') : (to.startsWith('+') ? to : `+256${to}`);

  try {
    const response = await fetch("https://api.africastalking.com/version1/messaging", {
      method: "POST",
      headers: { 
        "apiKey": process.env.AT_API_KEY!, 
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json"
      },
      body: new URLSearchParams({
        username: process.env.AT_USERNAME!,
        to: sanitizedTo,
        message: message,
        // from: "70889" // REMOVE THIS if you don't have a registered Sender ID
      })
    });

    // Check if the request was successful
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`SMS API Failed (${response.status}):`, errorText);
      return;
    }

    const data = await response.json();
    console.log("SMS API Success:", JSON.stringify(data));
  } catch (error) {
    console.error("SMS API Connection Error:", error);
  }
}

export async function POST(req: NextRequest) {
  const supabase = getSupabase();
  const formData = await req.formData();
  const text = formData.get('text')?.toString() || "";
  const phoneNumber = formData.get('phoneNumber')?.toString() || "";
  
  const parts = text.split('*');
  let response = "";

  try {
    // 1. MAIN MENU
    if (text === "") {
      response = "CON Welcome to Radar\n1. View Events\n2. Update Interests\n3. Set Profile\n4. Check-in & Match";
    }

    // 1. VIEW EVENTS
    else if (parts[0] === "1") {
      if (parts.length === 1) response = "CON Select Category:\n1. Tech\n2. AI";
      else if (parts.length === 2) {
        const cat = parts[1] === "1" ? "TECH" : "AI";
        const { data: events } = await supabase.from('events').select('id, name').ilike('category', cat);
        response = (!events || events.length === 0) ? "END No events." : "CON Select event:\n" + events.map((e: any, i: number) => `${i + 1}. ${e.name}`).join("\n");
      } else if (parts.length === 3) {
        const cat = parts[1] === "1" ? "TECH" : "AI";
        const idx = parseInt(parts[2]) - 1;
        const { data: events } = await supabase.from('events').select('*').ilike('category', cat);
        
        if (events?.[idx]) {
          await supabase.from('registrations').insert([{ phone_number: phoneNumber, event_id: events[idx].id }]);
          
          // Send SMS
          await sendSMS(phoneNumber, `Success! You have registered for ${events[idx].name}.`);
          
          response = "END Registered for " + events[idx].name;
        } else response = "END Event not found.";
      }
    }

    // 2. INTERESTS (Wizard)
    else if (parts[0] === "2") {
      if (parts.length === 1) response = "CON Add Interests:\n1. AI\n2. Cyber\n3. Data\n0. Finish";
      else if (parts[1] === "0") response = "END Interests saved!";
      else {
        const mapping: any = { "1": "AI", "2": "Cybersecurity", "3": "Data Analysis" };
        const selected = mapping[parts[1]];
        const { data: user } = await supabase.from('users').select('interests').eq('phone_number', phoneNumber).single();
        const current = user?.interests || [];
        if (!current.includes(selected)) await supabase.from('users').upsert({ phone_number: phoneNumber, interests: [...current, selected] });
        response = "CON Added " + selected + "! Add more or 0 to finish.";
      }
    }

    // 3. SET PROFILE (Wizard)
    else if (parts[0] === "3") {
      if (parts.length === 1) response = "CON Gender:\n1. Male\n2. Female";
      else if (parts.length === 2) response = "CON Age Bracket:\n1. 18-25\n2. 26-35\n3. 36+";
      else if (parts.length === 3) response = "CON Intent:\n1. Networking\n2. Dating\n3. Both";
      else {
        await supabase.from('users').upsert({
          phone_number: phoneNumber,
          gender: parts[1] === "1" ? "Male" : "Female",
          age_bracket: parts[2] === "1" ? "18-25" : parts[2] === "2" ? "26-35" : "36+",
          intent: parts[3] === "1" ? "Networking" : parts[3] === "2" ? "Dating" : "Both"
        });
        response = "END Profile saved successfully!";
      }
    }

    // 4. CHECK-IN & MATCH
    else if (parts[0] === "4") {
      await supabase.from('users').update({ status: 'searching' }).eq('phone_number', phoneNumber);
      response = "END Searching for a match... You will receive an SMS shortly!";
    }

    else { response = "END Invalid selection."; }
  } catch (err) { 
    console.error("USSD Critical Error:", err);
    response = "END System busy."; 
  }

  return new NextResponse(response, { status: 200, headers: { 'Content-Type': 'text/plain' } });
}