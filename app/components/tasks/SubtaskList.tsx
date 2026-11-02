"use client"

import type { Subtask } from "@/app/types/tasks";
import { Accordion, AccordionTab } from "primereact/accordion";
import styles from "./Tasks.module.css";

interface Props {
    subtasks: Subtask[];
}

export default function SubtaskList({ subtasks }: Props) {
    if (subtasks.length === 0) {
        return <p className={styles.empty}>Keine Subtasks vorhanden.</p>;
    }

    return (
        <Accordion multiple className={styles.subAccordion}>
            {subtasks.map((s) => (
                <AccordionTab
                    key={s.id}
                    headerTemplate={
                        <div className={styles.row}>
                            <span className={styles.name}>{s.name}</span>
                            <span className={styles.status} data-status={s.status}>{s.status}</span>
                            <span>{s.assignee ?? "–"}</span>
                            <span>{s.due_date ? new Date(s.due_date).toLocaleDateString("de-DE") : "–"}</span>
                        </div>
                    }
                >
                    <p>{s.description ?? "Keine Beschreibung."}</p>
                </AccordionTab>
            ))}
        </Accordion>
    );
}