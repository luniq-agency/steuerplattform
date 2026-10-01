import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  const event = await request.json();

  if (event.type === 'email.received') {
    const emailContent = await resend.emails.get(event.data.email_id);
    const { from, to, subject } = event.data;
    console.log('Email von:', from);
    console.log('Betreff:', subject);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    await supabase.from('email').insert({
      from: event.data.from,
      to: event.data.to,
      subject: event.data.subject,
      body: emailContent.data?.html ?? emailContent.data?.text,
      received_at: event.created_at,
    });
  }

  return NextResponse.json({});
}
