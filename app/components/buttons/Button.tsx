import { LucideIcon } from "lucide-react";
import styles from "./Buttons.module.css"

interface Props {
    disabled?: boolean;
    icon?: LucideIcon;
    label?: string;
    loading?: boolean;
    mode: 'primary' | 'secondary' | 'tertiary';
    onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
    size?: 'small' | 'medium' | 'large';
    type?: 'button' | 'reset' | 'submit';
}

const modeStyles: Record<NonNullable<Props['mode']>, React.CSSProperties> = {
    primary: { backgroundColor: 'white', borderColor: 'white', color: 'black', minHeight: 40 },
    secondary: { backgroundColor: '#2a2a2c', borderColor: '#2a2a2c', color: 'white' },
    tertiary: { backgroundColor: '#2a2a2c', borderColor: '#2a2a2c', color: 'white' }
};

const sizeStyles: Record<NonNullable<Props['size']>, React.CSSProperties> = {
    large: { borderRadius: 20, fontSize: 16, padding: '12px 24px' },
    medium: { borderRadius: 12, fontSize: 14, padding: '8px 12px' },
    small: { borderRadius: 8, fontSize: 12, padding: '4px 8px' },
};

export default function Button({ disabled, icon, label, loading, mode, onClick, size = 'medium', type = 'button' }: Props) {
    const modes = modeStyles[mode];
    const sizes = sizeStyles[size];

    return (
        <button className={disabled ? `${styles.disabled} ${styles.button}` : styles.button} disabled={disabled} onClick={onClick} style={{ ...modes, ...sizes }} type={type}>{label}</button>
    )
}