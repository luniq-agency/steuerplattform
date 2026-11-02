export type Ausgabe = {
    bestaetigt: boolean;
    betrag_brutto: number;
    betrag_gesamt: number;
    betrag_steuern: number;
    bezeichnung: string;
    created_at: Date;
    created_by: number;
    datum: Date;
    extraktion: string;
    konfidenz: number;
    konto: string;
    lieferant: string;
    notiz: string;
    quelle: string;
    rechnungsnummer: string;
    status: string;
    steuersatz: number;
    team: number;
    waehrung: string;
}