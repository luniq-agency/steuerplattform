import { Eye, EyeClosed } from "lucide-react";
import { IconButton } from "../buttons/IconButton";
import Column from "../layout/Column";
import styles from "./Inputs.module.css";

interface Props {
    inputRef?: React.Ref<HTMLInputElement>;
    label?: string;
    onChange: (value: string) => void;
    onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    mode?: 'light' | 'dark';
    password?: boolean;
    type?: 'text' | 'email' | 'password';
    value: string;
}

const modeStyles: Record<NonNullable<Props['mode']>, React.CSSProperties> = {
    light: { backgroundColor: 'white', borderColor: 'var(--border-color)', color: 'black' },
    dark: { backgroundColor: '#2a2a2c', borderColor: '#2a2a2c', color: 'white' },
};

export default function TextInput({ label, mode = "light", onChange, password = false, type = "text", value }: Props) {
    const modeStyle = modeStyles[mode];

    const toggle = () => { }

    return (
        <Column gap={4}>
            {label && <label>{label}</label>}
            <input className={styles.input} onChange={(e) => onChange(e.target.value)} style={{ ...modeStyle }} type={type} value={value} />
            {password && <IconButton icon={EyeClosed} onClick={toggle} />}
        </Column>
    )
}