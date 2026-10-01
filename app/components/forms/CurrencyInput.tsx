import { InputNumber } from 'primereact/inputnumber';

interface Props {
  additional?: string;
  label: string;
  onChange: (value: number) => void;
  value: number;
}

export function CurrencyInput({ additional, label, onChange, value }: Props) {
  return (
    <div className="column width-100 gap-xs">
      <div className="row align-center gap-xs">
        <label>
          {label} {additional && additional}
        </label>
      </div>
      <InputNumber
        currency="eur"
        mode="currency"
        onChange={(e) => onChange?.(e.value || 0)}
        value={value}
      />
    </div>
  );
}
