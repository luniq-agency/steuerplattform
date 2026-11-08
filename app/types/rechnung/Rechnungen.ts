export type Rechnung = {
  created_at: Date;
  betrag_gesamt: number;
  betrag_netto: number;
  betrag_steuern: number;
  bezahlziel: Date;
  empfaenger: string;
  erinnerung_datum?: Date;
  erinnerung_gesendet?: boolean;
  hausnummer: string;
  id: string;
  kundennummer: string;
  land: string;
  link: string;
  mandant: number;
  ort: string;
  plz: string;
  preise_inklusive: boolean;
  rechnungsdatum: Date;
  rechnungsnummer: string;
  sendedatum: Date;
  status: 'entwurf' | 'gesendet' | 'bezahlt' | 'ueberfaellig';
  steuersatz: number;
  strasse: string;
  ust: string;
};

export type Rechnungsposten = {
  beschreibung: string;
  einzelpreis: number;
  gesamtpreis: number;
  id: string;
  index: number;
  menge: number;
  rechnung: string;
  steuern: number;
};

export type TempPosten = {
  beschreibung: string;
  einzelpreis: number;
  gesamtpreis: number;
  id: string;
  index: number;
  menge: number;
  rechnung?: string;
  steuern?: number;
};