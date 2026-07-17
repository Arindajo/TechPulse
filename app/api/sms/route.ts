import { NextRequest, NextResponse } from 'next/server';
import events from '../../../events.json'; 

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const text = (formData.get('text') as string).trim().toUpperCase();

    //  Search Logic
    const filteredEvents = events.filter(e => e.category === text);
    
    //  Build Dynamic Response
    let reply = filteredEvents.length > 0 
      ? filteredEvents.map(e => `${e.name} (ID: ${e.id})`).join(', ')
      : "No events found. Try 'TECH' or 'AI'.";

    const xmlResponse = `<?xml version="1.0" encoding="UTF-8"?>
    <Response>
      <SMS>${reply}</SMS>
    </Response>`;

    return new NextResponse(xmlResponse, {
      status: 200,
      headers: { 'Content-Type': 'application/xml' },
    });
  } catch (error) {
    return new NextResponse('Error', { status: 500 });
  }
}