import { ReactNode } from "react";
import styles from "./UI.module.css";

interface Props {
    children: ReactNode;
}

export default function Floater({children}:Props) {

    return (
        <div className={styles.floater}>
{children}
        </div>
    )
}