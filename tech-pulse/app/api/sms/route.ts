import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    //  Parse the incoming form data from API
    const formData = await req.formData();
    
    // API specific fields
    const phoneNumber = formData.get('from');
    const text = formData.get('text');
    const sessionId = formData.get('sessionId');

    console.log(`Received SMS from ${phoneNumber}: ${text}`);

  
    const responseMessage = `Hello! We received your request: "${text}". Our system is currently setting up your event matches!`;

    //  Return the response in XML format as required by API

    const xmlResponse = `<?xml version="1.0" encoding="UTF-8"?>
    <Response>
      <SMS>${responseMessage}</SMS>
    </Response>`;

    return new NextResponse(xmlResponse, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  } catch (error) {
    console.error('Error handling SMS:', error);
    return new NextResponse('Error', { status: 500 });
  }
}