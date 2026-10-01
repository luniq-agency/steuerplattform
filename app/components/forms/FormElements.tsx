import { KeyRound, Lock } from 'lucide-react';
import Image from 'next/image';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { InputNumber } from 'primereact/inputnumber';
import { InputSwitch } from 'primereact/inputswitch';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Password } from 'primereact/password';
import { SelectItemOptionsType } from 'primereact/selectitem';
import { Skeleton } from 'primereact/skeleton';
import { useState } from 'react';

interface Props {
  additional?: string;
  autoComplete?: 'new-password' | 'current-password';
  booleanValue?: boolean;
  dateValue?: Date;
  height?: string;
  icon?: string;
  image?: string;
  label?: string;
  maxDate?: Date;
  minDate?: Date;
  maxWidth?: number;
  numberValue?: number;
  onBooleanChange?: (value: boolean) => void;
  onChange?: (value: string) => void;
  onDateChange?: (value: Date) => void;
  onNumberChange?: (value: number) => void;
  optionLabel?: string;
  optionValue?: string;
  options?: SelectItemOptionsType;
  placeholder?: string;
  readonly?: boolean;
  showCalendar?: boolean;
  url?: string;
  value?: string;
}

export function DatePicker({ label, maxDate, minDate, onDateChange, dateValue }: Props) {
  const [inputValue, setInputValue] = useState(
    dateValue ? dateValue.toLocaleDateString('de-DE') : ''
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    const parts = val.split('.');
    if (parts.length === 3 && parts[2].length === 4) {
      const date = new Date(
        `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
      );
      if (!isNaN(date.getTime())) onDateChange?.(date);
    }
  };

  return (
    <div className="column width-100 gap-xs">
      <label>{label}</label>
      <InputText onChange={handleChange} placeholder="TT.MM.JJJJ" value={inputValue} />
    </div>
  );
}

export function InputSwitchLabel({ additional, booleanValue, label, onBooleanChange }: Props) {
  return (
    <div className="row align-center width-100 space-between">
      <div className="column">
        <span style={{ fontSize: 14, fontWeight: 600 }}>{label}</span>
        <span className="text-description">{additional}</span>
      </div>
      <InputSwitch checked={booleanValue ?? false} onChange={(e) => onBooleanChange?.(e.value)} />
    </div>
  );
}

export function NumberInputLabel({ additional, label, onNumberChange, numberValue }: Props) {
  return (
    <div className="column width-100 gap-xs">
      <div className="row align-center gap-xs">
        <label>
          {label} {additional && additional}
        </label>
      </div>
      <InputNumber onChange={(e) => onNumberChange?.(e.value || 0)} value={numberValue} />
    </div>
  );
}

export function PasswordInputIconAuth({ autoComplete, icon, onChange, placeholder, value }: Props) {
  return (
    <IconField className="row gap-xs align-center" iconPosition="left">
      <KeyRound color="var(--primary" size={18} />
      <Password
        autoComplete={autoComplete}
        feedback={false}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        value={value}
      />
    </IconField>
  );
}

export function PasswordInput({ autoComplete, label, maxWidth, onChange, value }: Props) {
  return (
    <div className="column width-100 gap-xs" style={{ maxWidth }}>
      <label>{label}</label>
      <Password
        autoComplete={autoComplete}
        feedback={false}
        onChange={(e) => onChange?.(e.target.value)}
        value={value}
      />
    </div>
  );
}

export function SelectLabel({ label, onChange, optionLabel, optionValue, options, value }: Props) {
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

export function SkeletonLoaderLabel({ height, label, onChange, value }: Props) {
  return (
    <div className="column width-100 gap-xs">
      <label>{label}</label>
      <Skeleton height={height} width="100%" />
    </div>
  );
}

export function SocialMediaInput({ image, onChange, value }: Props) {
  return (
    <div className="row width-100 gap-s">
      <Image alt="" height={32} src={image || ''} width={32} />
      <InputText onChange={(e) => onChange?.(e.target.value)} value={value ?? ''} />
    </div>
  );
}

export function TextAreaLabel({ label, onChange, value }: Props) {
  return (
    <div className="column width-100 gap-xs">
      <label>{label}</label>
      <InputTextarea onChange={(e) => onChange?.(e.target.value)} value={value ?? ''} />
    </div>
  );
}

export function TextInputIconAuth({ icon, onChange, placeholder, value }: Props) {
  return (
    <IconField iconPosition="left">
      <InputIcon className={icon}></InputIcon>
      <InputText
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        value={value ?? ''}
      />
    </IconField>
  );
}

export function TextInputLabel({
  additional,
  label,
  maxWidth,
  onChange,
  placeholder,
  readonly,
  value,
}: Props) {
  return (
    <div className="column width-100 gap-xs" style={{ maxWidth }}>
      <div className="row align-center gap-xs">
        <label>
          {label} {additional && additional}
        </label>
      </div>
      <InputText
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        readOnly={readonly}
        value={value ?? ''}
      />
    </div>
  );
}
