import Link from "next/link";
import styles from "./Vorgang.module.css";
import { Vorgang } from "@/app/types/vorgang";
import StatusTag from "../status/StatusTag";
import { status_options } from "@/app/constants/status";

interface Props {
    level: 'admin' | 'agentur' | 'dashboard';
    vorgang: Vorgang;
}

export default function VorgangCard({ level, vorgang }: Props) {
    const status = status_options.find((s) => s.value == vorgang.status);
    if (!status) return;
    return (
        <Link className={styles.vorgangCard} href={`/${level}/vorgang/${vorgang.id}`}>
            <h2>{vorgang.titel}</h2>
            <StatusTag bg="black" color="white" label={status?.label} />
        </Link>
    )
}