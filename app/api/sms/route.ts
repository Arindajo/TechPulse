import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '../lib/supabase/client';

export async function POST(req: NextRequest) {
  const supabase = getSupabase();
  const formData = await req.formData();
  const text = formData.get('text')?.toString().trim().toUpperCase() || "";

  if (text.startsWith("YES")) {
    const matchId = text.replace("YES", "");
    const { data: match } = await supabase.from('matches')
      .update({ status: 'accepted' })
      .eq('id', matchId)
      .select('sender_phone, receiver_phone')
      .single();

    if (match) {
      // In a production app, trigger an Edge Function here to notify numbers
      return new NextResponse('<Response><SMS>Connected! Exchanging contact info...</SMS></Response>', { headers: {'Content-Type': 'application/xml'} });
    }
  }
  return new NextResponse('<Response><SMS>Invalid code.</SMS></Response>', { headers: {'Content-Type': 'application/xml'} });
}