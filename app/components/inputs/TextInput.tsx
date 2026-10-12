import Column from "../layout/Column";
import styles from "./Inputs.module.css";

interface Props {
    label?: string;
    onChange: (value: string) => void;
    mode?: 'light' | 'dark';
    type?: 'text' | 'email' | 'password';
    value: string;
}

const modeStyles: Record<NonNullable<Props['mode']>, React.CSSProperties> = {
    light: { backgroundColor: 'white', borderColor: 'white', color: 'black' },
    dark: { backgroundColor: '#2a2a2c', borderColor: '#2a2a2c', color: 'white' }
};

export default function TextInput({ label, mode = "light", onChange, type = "text", value }: Props) {
    const modeStyle = modeStyles[mode];

    return (
        <Column gap={4}>
            {label && <label>{label}</label>}
            <input className={styles.input} onChange={(e) => onChange(e.target.value)} style={{ ...modeStyle }} type={type} value={value} />
        </Column>
    )
}