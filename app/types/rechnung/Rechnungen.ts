export type Rechnung = {
    created_at: Date;
    betrag_gesamt: number;
    betrag_netto: number;
    betrag_steuern: number;
    bezahlziehl: Date;
    erinnerung_datum?: Date;
    erinnerung_gesendet?: boolean;
    id: string;
    link: string;
    rechnungsdatum: Date;
    rechnungsnummer: string;
    sendedatum: Date;
    status: 'entwurf' | 'gesendet' | 'bezahlt' | 'ueberfaellig';
}

export type Rechnungsposten = {
beschreibung: string;
einzelpreis: number;
gesamtpreis: number;
id: string;
index: number;
menge: number;
    rechnung: string;
    steuern: number;
}