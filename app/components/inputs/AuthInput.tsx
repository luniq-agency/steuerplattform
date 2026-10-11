import styles from "./Inputs.module.css";

interface Props {
    onChange: (value: string) => void;
    placeholder?: string;
    value: string;
}

export default function AuthInput({ onChange, placeholder, value }: Props) {
    return (
        <input className={styles.inputAuth} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} value={value} />
    )
}