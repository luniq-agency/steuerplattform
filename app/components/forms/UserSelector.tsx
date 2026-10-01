import { User } from '@/app/types/Database';
import { Dropdown } from 'primereact/dropdown';

interface Props {
  label: string;
  onChange: (value: User) => void;
  optionLabel: string;
  options: User[];
  value: User | null;
}

export default function UserSelector({ label, onChange, optionLabel, options, value }: Props) {
  return (
    <div className="column width-100 gap-xs">
      <label>{label}</label>
      <Dropdown
        onChange={(e) => onChange?.(e.value)}
        optionLabel={optionLabel}
        options={options}
        value={value}
      />
    </div>
  );
}
