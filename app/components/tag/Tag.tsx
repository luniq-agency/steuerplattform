import { LucideIcon } from "lucide-react";
import styles from "./Tag.module.css";

interface Props {
    icon?: LucideIcon;
    label: string;
    mode?: 'warning';
}

const modeStyles: Record<NonNullable<Props['mode']>, React.CSSProperties> = {
    warning: { backgroundColor: 'var(--warning-bg)', color: 'var(--warning-text)' }
};

export default function Tag({ icon: Icon, label, mode = 'warning' }: Props) {
    const modes = modeStyles[mode];

    return (
        <span className={styles.tag} style={{ ...modes }}>
            {Icon && <Icon color={modes.color} size={12} />} {label}
        </span>
    );
}