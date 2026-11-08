import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/app/utils/supabase/admin';
import { emailMaskieren, sha256, sitzungPruefen, sitzungsCookieName } from '@/app/utils/uploadLink/sicherheit';
import UploadClient from './UploadClient';
import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Dokumente hochladen | ADVACT', robots: { index: false } };

export default async function HochladenPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = await params;

    const { data: link } = /^[A-Za-z0-9_-]{30,64}$/.test(token)
        ? await supabaseAdmin
            .from('upload_link')
            .select('id, mandant, vorgang, nachricht, expires_at, revoked_at')
            .eq('token_hash', sha256(token))
            .maybeSingle()
        : { data: null };

    const gueltig = !!link && !link.revoked_at && new Date(link.expires_at) > new Date();

    if (!gueltig) {
        return (
            <main style={{ maxWidth: 480, margin: '0 auto', padding: '64px 16px' }}>
                <h1>Link nicht gültig</h1>
                <p>Dieser Upload-Link ist abgelaufen oder wurde zurückgezogen. Bitte wende dich an deine Kanzlei, um einen neuen Link zu erhalten.</p>
            </main>
        );
    }

    const { data: mandant } = await supabaseAdmin.from('user').select('vorname, email').eq('id', link.mandant).single();
    const { data: vorgang } = link.vorgang
        ? await supabaseAdmin.from('vorgang').select('titel').eq('id', link.vorgang).single()
        : { data: null };
    const jar = await cookies();
    const verifiziert = sitzungPruefen(jar.get(sitzungsCookieName(link.id))?.value, link.id);

    return (
        <main style={{ maxWidth: 560, margin: '0 auto', padding: '64px 16px' }}>
            <UploadClient
                emailHinweis={mandant?.email ? emailMaskieren(mandant.email) : null}
                nachricht={link.nachricht ?? null}
                token={token}
                verifiziert={verifiziert}
                vorgangTitel={vorgang?.titel ?? null}
                vorname={mandant?.vorname ?? ''}
            />
        </main>
    );
}