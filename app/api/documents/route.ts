import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const ALLOWED_TYPES: Record<string, string> = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
};

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;
    const user = formData.get('user') as string;

    if (!file || !name) {
      return NextResponse.json({ error: 'Fehlende Parameter' }, { status: 400 });
    }

    const extension = ALLOWED_TYPES[file.type];
    if (!extension) {
      return NextResponse.json({ error: 'Nur PDF und DOCX erlaubt' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const filePath = `${user}/${Date.now()}.${extension}`;

    const { error: storageError } = await supabase.storage
      .from('uploads')
      .upload(filePath, buffer, { contentType: file.type });

    if (storageError) {
      return NextResponse.json({ error: storageError.message }, { status: 500 });
    }

    const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(filePath);

    const { data, error: dbError } = await supabase
      .from('document')
      .insert({
        document_name: name,
        document_file: urlData.publicUrl,
        client: user,
      })
      .select()
      .single();

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('Upload Fehler:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
