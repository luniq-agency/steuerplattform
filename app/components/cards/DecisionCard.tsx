import { LucideIcon } from "lucide-react";
import styles from "./Cards.module.css";

interface Props {
    headline: string;
    icon: LucideIcon;
    onClick: () => void;
    selected: boolean;
    sub: string;
}

export default function DecisionCard({ headline, icon: Icon, onClick, selected = false, sub }: Props) {
    const type = selected ? `${styles.decisionCard} ${styles.selected}` : `${styles.decisionCard}`

    return (
        <div className={type} onClick={onClick}>
            <Icon size={24} />
            <span className={styles.decisionCardHeadline}>{headline}</span>
            <span className={styles.decisionCardBody}>{sub}</span>
        </div>
    )
}