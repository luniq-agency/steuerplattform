import styles from "./Inputs.module.css";

interface Props {
    onChange: (value: string) => void;
    placeholder?: string;
    show?: boolean;
    value: string;
}

export default function AuthPassword({ onChange, placeholder, show, value }: Props) {
    return (
        <input className={styles.inputAuth} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} type={show ? 'text' : 'password'} value={value} />
    )
}