'use client';

import { useEffect, useState } from 'react';
import { SelectItemOptionsType } from 'primereact/selectitem';
import { Dropdown } from 'primereact/dropdown';
import Column from '../../layout/Column';
import { IconButton } from '../../buttons/IconButton';
import styles from '../Inputs.module.css';
import { X } from 'lucide-react';

interface Props {
    filter?: boolean;
    label?: string;
    maxWidth?: string | number | undefined;
    onChange: (value: any) => void;
    onClear?: () => void;
    options?: SelectItemOptionsType;
    optionDescription?: string;
    optionLabel?: string;
    optionValue?: string;
    placeholder?: string;
    showClear?: boolean;
    value: string | number | null;
}

export function SelectLabel({
    filter = false,
    label,
    maxWidth,
    onChange,
    onClear,
    optionDescription,
    options,
    optionLabel = 'label',
    optionValue = 'value',
    placeholder,
    showClear = false,
    value,
}: Props) {
    // Dropdown erst im Browser rendern (PrimeReact greift beim Rendern aufs DOM zu)
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

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
            {mounted ? (
                <Dropdown
                    filter={filter}
                    itemTemplate={optionDescription ? itemTemplate : undefined}
                    onChange={(e) => onChange(e.value)}
                    options={options ?? []}
                    optionLabel={optionLabel}
                    optionValue={optionValue}
                    placeholder={placeholder}
                    value={value ?? null}
                />
            ) : (
                // gleich große Hülle, damit nichts springt
                <div className="p-dropdown p-component p-inputwrapper" style={{ width: '100%' }}>
                    <span className="p-dropdown-label p-inputtext p-placeholder">{placeholder ?? '\u00A0'}</span>
                </div>
            )}
            {showClear && (
                <div className={styles.clearButton} style={{ right: 48 }}>
                    <IconButton bg="transparent" icon={X} onClick={onClear} />
                </div>
            )}
        </Column>
    );
}