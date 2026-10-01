import { Dropdown } from 'primereact/dropdown';
import Column from '../layout/Column';
import { SelectItemOptionsType } from 'primereact/selectitem';
import { User } from '@/app/types/Database';
import { IconButton } from '../buttons/IconButton';
import styles from './Inputs.module.css';
import { X } from 'lucide-react';

interface Props {
  label?: string;
  maxWidth?: string | number | undefined;
  onChange: (value: string) => void;
  onClear?: () => void;
  options?: SelectItemOptionsType;
  optionDescription?: string;
  optionLabel: string;
  optionValue: string;
  placeholder?: string;
  showClear?: boolean;
  value: string | number;
}

interface UserProps {
  label?: string;
  onChange: (value: User) => void;
  options?: SelectItemOptionsType;
  optionLabel: string;
  value: User | null;
}

export function SelectLabel({
  label,
  maxWidth,
  onChange,
  onClear,
  optionDescription,
  options,
  optionLabel,
  optionValue,
  placeholder,
  showClear = false,
  value,
}: Props) {
  const itemTemplate = (option: SelectItemOptionsType) => {
    const opt = option as Record<string, any>;
    return (
      <Column gap={4}>
        <span>{opt[optionLabel]}</span>
        {optionDescription && <span className="text-s">{opt[optionDescription]}</span>}
      </Column>
    );
  };

  return (
    <Column gap={4} maxWidth={maxWidth}>
      {label && <label>{label}</label>}
      <Dropdown
        className={styles.input}
        itemTemplate={itemTemplate}
        onChange={(e) => onChange(e.value)}
        options={options}
        optionLabel={optionLabel}
        optionValue={optionValue}
        placeholder={placeholder}
        value={value}
      />
      {showClear && (
        <div className={styles.clearButton} style={{ right: 48 }}>
          <IconButton bg="transparent" icon={X} onClick={onClear} />
        </div>
      )}
    </Column>
  );
}

export function UserSelectLabel({ label, onChange, options, value }: UserProps) {
  if (!options) return;
  const userOptions = options
    .map((a) => ({
      ...a,
      fullName: `${a.user_name_last}, ${a.user_name_first}`,
    }))
    .sort((a: User, b: User) => a.user_name_last.localeCompare(b.user_name_last));

  const matchedValue = userOptions.find((o) => o.id === value?.id) ?? null;

  return (
    <Column gap={4}>
      <label>{label}</label>
      <Dropdown
        filter
        filterPlaceholder="Suchen"
        onChange={(e) => onChange(e.value)}
        options={userOptions}
        optionLabel="fullName"
        value={matchedValue}
      />
    </Column>
  );
}
