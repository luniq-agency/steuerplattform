import { ReactNode } from "react";
import styles from "./Admin.module.css";

interface Props {
    children: ReactNode
}

export default function AdminPageHeader({children}:Props) {

    return (
        <div className={styles.pageHeader}>
            {children}
        </div>
    )
}