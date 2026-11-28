'use client';

import { InputText } from 'primereact/inputtext';
import { useEffect, useState } from 'react';
import { parseDate } from '@/app/utils/formats';

interface Props {
  label: string;
  onChange: (date: Date | null) => void;
  value: Date | string | null | undefined;
}

const anzeigen = (d: Date | null) =>
  d
    ? `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`
    : '';

const alsDatum = (v: Date | string | null | undefined): Date | null =>
  !v ? null : v instanceof Date ? v : parseDate(v);

export function DatePicker({ label, onChange, value }: Props) {
  const [inputValue, setInputValue] = useState(() => anzeigen(alsDatum(value)));

  // Wert von außen übernehmen (z. B. nach dem Laden einer Rechnung)
  useEffect(() => {
    const neu = anzeigen(alsDatum(value));
    setInputValue((aktuell) => (aktuell.length === 10 || aktuell === '' ? neu : aktuell));
  }, [value instanceof Date ? value.getTime() : value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 8); // nur Ziffern, max. TTMMJJJJ
    if (val.length > 4) val = `${val.slice(0, 2)}.${val.slice(2, 4)}.${val.slice(4)}`;
    else if (val.length > 2) val = `${val.slice(0, 2)}.${val.slice(2)}`;

    setInputValue(val);

    if (val === '') return onChange(null);

    const [t, m, j] = val.split('.').map(Number);
    if (val.length === 10) {
      const date = new Date(j, m - 1, t); // lokale Zeit, keine UTC-Verschiebung
      const gueltig = date.getFullYear() === j && date.getMonth() === m - 1 && date.getDate() === t;
      if (gueltig) onChange(date);
    }
  };

  return (
    <div className="column width-100 gap-xs">
      <label>{label}</label>
      <InputText inputMode="numeric" onChange={handleChange} placeholder="TT.MM.JJJJ" value={inputValue} />
    </div>
  );
}