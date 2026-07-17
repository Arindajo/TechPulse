import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const text = formData.get('text') as string || ""; // e.g., "", "1", "1*2"
    const phoneNumber = formData.get('phoneNumber');

    let response = "";

    // 1. Initial Menu
    if (text === "") {
      response = "CON Welcome to TechPulse\n1. View Tech Events\n2. View AI Events";
    } 
    // 2. Logic for Menu 1
    else if (text === "1") {
      response = "END Here is your Tech Event: Tech Meetup (ID: 101)";
    }
    // 3. Logic for Menu 2
    else if (text === "2") {
      response = "END Here is your AI Event: AI Workshop (ID: 102)";
    }
    // 4. Default/Error
    else {
      response = "END Invalid selection. Goodbye!";
    }

    return new NextResponse(response, {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
  } catch (error) {
    console.error("USSD Error:", error);
    return new NextResponse("END Error processing request", { status: 200 });
  }
}