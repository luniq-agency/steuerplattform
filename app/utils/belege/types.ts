// Gemeinsame Typen der Beleg-Erkennung

export type BelegQuelle = 'xrechnung' | 'zugferd' | 'pdf_text' | 'manuell';

export type BelegFelder = {
  lieferant: string | null;
  rechnungsnummer: string | null;
  datum: string | null; // 'YYYY-MM-DD'
  betrag_netto: number | null;
  betrag_steuern: number | null;
  betrag_brutto: number | null;
  steuersatz: number | null; // 0.19 / 0.07 / 0
  waehrung: string | null;
  ust_id: string | null;
  iban: string | null;
};

export type BelegErgebnis = {
  quelle: BelegQuelle;
  felder: BelegFelder;
  pruefen: (keyof BelegFelder)[]; // Felder, die der Nutzer prüfen soll
  hinweise: string[];             // z. B. "Netto + MwSt. ergibt nicht den Bruttobetrag"
  konfidenz: number;              // 0–1
  rohtext?: string;               // für späteren LLM-Fallback, nicht an den Client schicken
};

export const LEERE_FELDER: BelegFelder = {
  lieferant: null,
  rechnungsnummer: null,
  datum: null,
  betrag_netto: null,
  betrag_steuern: null,
  betrag_brutto: null,
  steuersatz: null,
  waehrung: null,
  ust_id: null,
  iban: null,
};