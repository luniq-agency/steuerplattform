import { Dropdown } from 'primereact/dropdown';
import Column from '../layout/Column';
import { SelectItemOptionsType } from 'primereact/selectitem';

interface Props {
  label: string;
  onChange: (value: Date) => void;
  options?: SelectItemOptionsType;
  optionLabel: string;
  optionValue: string;
  value: Date;
}

export function SelectLabel({ label, onChange, options, optionLabel, optionValue, value }: Props) {
  return (
    <Column gap={4}>
      <label>{label}</label>
      <Dropdown
        onChange={(e) => onChange(e.value)}
        options={options}
        optionLabel={optionLabel}
        optionValue={optionValue}
        value={value}
      />
    </Column>
  );
}
