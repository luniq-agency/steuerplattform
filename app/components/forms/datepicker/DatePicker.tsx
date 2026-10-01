import { InputText } from 'primereact/inputtext';
import { useState } from 'react';

interface Props {
  label: string;
  onChange: (date: Date) => void;
  value: Date | string | null;
}

export function DatePicker({ label, onChange, value }: Props) {
  const dateValue = value ? new Date(value) : null;
  const [inputValue, setInputValue] = useState(
    dateValue ? dateValue.toLocaleDateString('de-DE') : ''
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, ''); // nur Zahlen

    if (val.length > 2) val = val.slice(0, 2) + '.' + val.slice(2);
    if (val.length > 5) val = val.slice(0, 5) + '.' + val.slice(5);
    if (val.length > 10) val = val.slice(0, 10); // max TT.MM.JJJJ

    setInputValue(val);

    const parts = val.split('.');
    if (parts.length === 3 && parts[2].length === 4) {
      const date = new Date(
        `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
      );
      if (!isNaN(date.getTime())) onChange?.(date);
    }
  };

  return (
    <div className="column width-100 gap-xs">
      <label>{label}</label>
      <InputText onChange={handleChange} placeholder="TT.MM.JJJJ" value={inputValue} />
    </div>
  );
}
