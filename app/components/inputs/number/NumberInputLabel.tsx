import Column from "../../layout/Column";
import styles from "../Inputs.module.css";

interface Props {
    disabled?: boolean;
    label: string;
    max?: number;
    min?: number;
    onChange: (value: number) => void;
    value: number;
}

export default function NumberInputLabel({ disabled, label, max, min, onChange, value }: Props) {

    return (
        <Column gap={4}>
            {label && <label>{label}</label>}
            <input
                className={styles.input}
                disabled={disabled}
                max={max}
                min={min}
                onChange={(e) => onChange(e.target.value === '' ? 0 : Number(e.target.value))}
                type="number"
                value={value}
            />
        </Column>
    )
}