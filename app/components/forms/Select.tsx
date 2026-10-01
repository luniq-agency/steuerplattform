import { User } from '@/app/types/Database';
import { Dropdown } from 'primereact/dropdown';

interface UserSelectProps {
  label: string;
  onChange: (value: string) => void;
  optionLabel: string;
  optionValue: string;
  options: User[];
  value: string;
}

export function UserSelect({
  label,
  onChange,
  optionLabel,
  optionValue,
  options,
  value,
}: UserSelectProps) {
  return (
    <div className="column width-100 gap-xs">
      <label>{label}</label>
      <Dropdown
        onChange={(e) => onChange?.(e.value)}
        optionLabel={optionLabel}
        optionValue={optionValue}
        options={options}
        value={value}
      />
    </div>
  );
}
