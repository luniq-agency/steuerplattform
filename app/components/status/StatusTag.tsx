import styles from "./Status.module.css"

interface Props {
    bg: string;
    color: string;
    label: string;
}

export default function StatusTag({ bg, color, label }: Props) {

    return (
        <div className={styles.tagWrapper} style={{ backgroundColor: bg, color }}>
            {label}
        </div>
    )
}