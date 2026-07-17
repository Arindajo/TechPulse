import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // Forcefully read the text body first to verify receipt
    const textBody = await req.text();
    console.log("RAW BODY RECEIVED:", textBody);

    // Pwarse as FormData
    const formData = await req.formData();
    console.log("FORM DATA PARSED:", Object.fromEntries(formData));

    return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><Response></Response>', {
      status: 200,
      headers: { 'Content-Type': 'application/xml' },
    });
    //error handling
  } catch (error) {
    console.error("CRITICAL ERROR IN ROUTE:", error);
    return new NextResponse('Error', { status: 500 });
  }
}