// Versand von HTML-Mails über Resend. Nur serverseitig verwenden.
import 'server-only';
import { Resend } from 'resend';
import { esc, wrapEmailTemplate } from './emails/emailUtils';

let client: Resend | null = null;
const resend = () => (client ??= new Resend(process.env.RESEND_API_KEY));

const FROM = 'ADVACT <info@conek.de>';

export async function sendHtmlEmail(to: string, subject: string, bodyHtml: string) {
  const { data, error } = await resend().emails.send({
    from: FROM,
    to,
    subject,
    html: wrapEmailTemplate(bodyHtml),
  });
  if (error) throw new Error(JSON.stringify(error));
  return data;
}

const button = (label: string, url: string) => `
  <p style="margin: 32px 0;">
    <a href="${esc(url)}" style="background-color: #1f1f1f; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">
      ${esc(label)}
    </a>
  </p>
  <p style="font-size: 13px; color: #9aa5b1;">Falls der Button nicht funktioniert, kopiere diesen Link in deinen Browser:<br />${esc(url)}</p>`;

export const templateUploadLink = (
  vorname: string,
  bearbeiter: string,
  url: string,
  tage: number,
  vorgangTitel?: string | null,
  nachricht?: string | null
) => `
  <h2 style="margin-top: 0;">Hallo ${esc(vorname)},</h2>
  <p>${esc(bearbeiter)} bittet dich, Unterlagen ${
    vorgangTitel
      ? `für <strong>${esc(vorgangTitel)}</strong>`
      : 'für deine Steuer- bzw. Buchhaltungsangelegenheiten'
  } hochzuladen. Über den folgenden Link kannst du deine Dokumente sicher übermitteln – ein Konto brauchst du dafür nicht.</p>
  ${
    nachricht
      ? `<div style="background: #f6f6f4; border-left: 3px solid #1f1f1f; border-radius: 4px; padding: 12px 16px; margin: 16px 0;">
           <p style="margin: 0 0 4px; font-size: 13px; color: #9aa5b1;">Nachricht von ${esc(bearbeiter)}:</p>
           <p style="margin: 0;">${esc(nachricht).replace(/\n/g, '<br />')}</p>
         </div>`
      : ''
  }
  ${button('Dokumente hochladen', url)}
  <p style="font-size: 13px; color: #9aa5b1;">Der Link ist ${tage} Tage gültig. Zur Sicherheit senden wir dir beim Öffnen einen Bestätigungscode an diese E-Mail-Adresse.</p>`;

export const templateUploadCode = (code: string, minuten: number) => `
  <h2 style="margin-top: 0;">Dein Bestätigungscode</h2>
  <p>Gib diesen Code auf der Upload-Seite ein, um deine Dokumente hochzuladen:</p>
  <p style="font-size: 32px; font-weight: bold; letter-spacing: 6px; margin: 24px 0;">${esc(code)}</p>
  <p style="font-size: 13px; color: #9aa5b1;">Der Code ist ${minuten} Minuten gültig. Falls du keinen Code angefordert hast, kannst du diese E-Mail ignorieren.</p>`;
