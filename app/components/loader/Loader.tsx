import { ProgressSpinner } from "primereact/progressspinner"
import styles from "./Loader.module.css"

interface Props {
    text: string
}
export default function Loader({ text }: Props) {
    return (
        <div className={styles.loader}>
            <ProgressSpinner strokeWidth="3px"/>
            {text}
        </div>
    )
}