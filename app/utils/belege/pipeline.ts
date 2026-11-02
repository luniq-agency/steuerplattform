// Erkennungsweiche: E-Rechnung → ZUGFeRD-PDF → PDF mit Textebene → manuell
// Läuft nur auf dem Server (wird aus der Server Action aufgerufen).
import 'server-only';
import { extractText, getDocumentProxy } from 'unpdf';
import { parseERechnung, ZUGFERD_DATEINAMEN } from './erechnung';
import { ergaenze, extrahiereAusText, validiere } from './extraktion';
import { BelegErgebnis, BelegFelder, LEERE_FELDER } from './types';

const MIN_TEXTLAENGE = 50; // weniger Text → vermutlich Scan/Foto ohne Textebene

function ergebnis(quelle: BelegErgebnis['quelle'], felder: BelegFelder, rohtext?: string): BelegErgebnis {
  const ergaenzt = ergaenze(felder);
  const { pruefen, hinweise, konfidenz } = validiere(ergaenzt);
  return {
    quelle,
    felder: ergaenzt,
    pruefen,
    hinweise,
    // E-Rechnungen sind strukturiert: volle Konfidenz, solange die Prüfungen bestehen
    konfidenz: quelle === 'xrechnung' || quelle === 'zugferd' ? (pruefen.length ? 0.8 : 1) : konfidenz,
    rohtext,
  };
}

export async function erkenneBeleg(
  bytes: Uint8Array,
  dateiname: string,
  mimeType?: string,
  bekannteLieferanten: string[] = []
): Promise<BelegErgebnis> {
  const name = dateiname.toLowerCase();

  // 1. Reine XML-Datei (XRechnung)
  if (name.endsWith('.xml') || mimeType?.includes('xml')) {
    const felder = parseERechnung(new TextDecoder().decode(bytes));
    if (felder) return ergebnis('xrechnung', felder);
    return { ...ergebnis('manuell', LEERE_FELDER), hinweise: ['Die XML-Datei ist keine bekannte E-Rechnung.'] };
  }

  // Bilder (Fotos, Scans): noch keine OCR → manuell bzw. später LLM-Fallback
  if (!name.endsWith('.pdf') && mimeType !== 'application/pdf') {
    return ergebnis('manuell', LEERE_FELDER);
  }

  let pdf;
  try {
    pdf = await getDocumentProxy(bytes.slice()); // slice: pdf.js übernimmt den Buffer
  } catch {
    return { ...ergebnis('manuell', LEERE_FELDER), hinweise: ['Das PDF konnte nicht gelesen werden.'] };
  }

  try {
    // 2. ZUGFeRD / Factur-X: eingebettetes XML
    // pdf.js liefert die Anhänge als Map; den Inhalt bei Bedarf nachladen
    const anhaenge = await pdf.getAttachments();
    if (anhaenge?.size) {
      const eintraege = [...anhaenge.entries()];
      const treffer =
        eintraege.find(([, a]) => ZUGFERD_DATEINAMEN.includes(a.filename.toLowerCase())) ??
        eintraege.find(([, a]) => a.filename.toLowerCase().endsWith('.xml'));
      if (treffer) {
        const [id, anhang] = treffer;
        const inhalt = anhang.content ?? (await pdf.getAttachmentContent(id));
        const felder = inhalt ? parseERechnung(new TextDecoder().decode(inhalt)) : null;
        if (felder) return ergebnis('zugferd', felder);
      }
    }

    // 3. Textebene auslesen (digitale PDFs)
    const { text } = await extractText(pdf, { mergePages: true });
    if (text.replace(/\s/g, '').length >= MIN_TEXTLAENGE) {
      return ergebnis('pdf_text', extrahiereAusText(text, bekannteLieferanten), text);
    }

    // 4. Gescanntes PDF ohne Text
    return ergebnis('manuell', LEERE_FELDER);
  } finally {
    await pdf.loadingTask.destroy();
  }
}