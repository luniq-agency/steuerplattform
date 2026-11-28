export type Vergleich = {
  vorher: number;
  differenz: number;
  prozent: number | null;
  richtung: 'hoch' | 'runter' | 'gleich';
  label: string; 
};

export const vergleiche = (aktuell: number, vorher: number, label: string): Vergleich => {
  const differenz = Math.round((aktuell - vorher) * 100) / 100;
  return {
    vorher,
    differenz,
    prozent: vorher ? Math.round((differenz / Math.abs(vorher)) * 1000) / 10 : null,
    richtung: differenz > 0 ? 'hoch' : differenz < 0 ? 'runter' : 'gleich',
    label,
  };
};