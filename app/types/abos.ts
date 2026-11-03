import type { TempPosten } from './rechnung/Rechnungen';

export type AboIntervall = 'monat' | 'quartal' | 'jahr';

export type AboStatus = 'entwurf' | 'aktiv' | 'gekuendigt' | 'beendet';

export type Abonnement = {
  id: number;
  created_at: string;
  created_by: number | null;
  mandant: number;
  bezeichnung: string;
  intervall: AboIntervall;
  positionen: TempPosten[];
  betrag_netto: number;
  steuersatz: number;
  betrag_brutto: number;
  zahlungsziel_tage: number;
  status: AboStatus;
  startdatum: string | null;
  naechste_rechnung: string | null;
  gekuendigt_zum: string | null;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
};