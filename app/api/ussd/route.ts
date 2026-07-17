import { NextRequest, NextResponse } from 'next/server';
import events from '../../../events.json';

const credentials = { apiKey: process.env.AT_API_KEY!, username: process.env.AT_USERNAME! };
const AfricasTalking = require('africastalking')(credentials);

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const text = formData.get('text')?.toString() || "";
  const phoneNumber = formData.get('phoneNumber')?.toString() || "";

  let response = "";

  if (text === "") {
    response = "CON Welcome to TechPulse\n1. View Tech Events\n2. View AI Events";
  } else if (text === "1" || text === "2") {
    const cat = text === "1" ? "TECH" : "AI";
    const filtered = events.filter(e => e.category === cat);
    response = "CON Select event to register:\n" + filtered.map((e, i) => `${i + 1}. ${e.name}`).join("\n");
  } else if (text.startsWith("1*") || text.startsWith("2*")) {
    // Logic: User selected an event. Trigger registration.
    const eventName = "Selected Event"; // Simplified: In real life, map index to event name
    
    // 1. Send SMS Confirmation
    try {
      await AfricasTalking.SMS.send({
        to: [phoneNumber],
        message: `Registered for ${eventName}! See you there.`,
        from: '1517' // Your sandbox shortcode
      });
    } catch (e) { console.error(e); }

    response = "END You have been registered! Check your SMS for confirmation.";
  }

  return new NextResponse(response, { status: 200, headers: { 'Content-Type': 'text/plain' } });
}