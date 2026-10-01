import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { TemplateInvite } from '@/app/components/emails/TemplateInvite';

const resend = new Resend(process.env.RESEND_API_KEY);

const templates: Record<string, (props: any) => React.ReactElement> = {
  agencyInvite: TemplateInvite,
};

const subjects: Record<string, string> = {
  invite: 'Du wurdest zu CONEK eingeladen',
  welcome: 'Willkommen bei CONEK',
};

export async function POST(request: NextRequest) {
  console.log('🔴 ROUTE AUFGERUFEN');

  try {
    const { templateId, to, props } = await request.json();
    const body = await request.json();
    console.log('Email API Body:', body);

    const template = templates[body.templateId];
    if (!template) {
      return NextResponse.json(
        { error: `Template '${body.templateId}' nicht gefunden` },
        { status: 400 }
      );
    }

    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to,
      subject: subjects[templateId],
      react: template(props),
    });

    console.log('Resend Response:', { data, error });

    if (error) return NextResponse.json({ error }, { status: 500 });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
