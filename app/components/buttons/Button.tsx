import { LucideIcon } from "lucide-react";
import styles from "./Buttons.module.css"

interface Props {
    disabled?: boolean;
    fill?: string;
    icon?: LucideIcon;
    image?: string;
    label?: string;
    loading?: boolean;
    mode?: 'primary' | 'secondary' | 'tertiary';
    onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
    size?: 'small' | 'medium' | 'large';
    type?: 'button' | 'reset' | 'submit';
    width?: string | number;
}

const modeStyles: Record<NonNullable<Props['mode']>, React.CSSProperties> = {
    primary: { backgroundColor: 'white', borderColor: 'white', color: 'black'},
    secondary: { backgroundColor: '#2a2a2c', borderColor: '#2a2a2c', color: 'white' },
    tertiary: { backgroundColor: '#ebebeb', borderColor: '#2a2a2c', color: 'black' }
};

const sizeStyles: Record<NonNullable<Props['size']>, React.CSSProperties> = {
    large: { borderRadius: 200, fontSize: 16, padding: '12px 24px' },
    medium: { borderRadius: 8, fontSize: 14, padding: '8px 12px' },
    small: { borderRadius: 8, fontSize: 12, padding: '6px 12px' },
};

export default function Button({ disabled, icon: Icon, fill = 'transparent', image, label, loading, mode = 'primary', onClick, size = 'medium', type = 'button', width = "fit-content" }: Props) {
    const modes = modeStyles[mode];
    const sizes = sizeStyles[size];

    return (
        <button className={disabled ? `${styles.disabled} ${styles.button}` : styles.button} disabled={disabled} onClick={onClick} style={{ ...modes, ...sizes, width }} type={type}>{image && <img src={image} width={16} />}{Icon && <Icon fill={fill} size={16} />}{label}</button>
    )
}