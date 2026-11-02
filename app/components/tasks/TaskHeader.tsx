import type { Task } from "@/app/types/tasks";
import styles from "./Tasks.module.css";

interface Props {
    task: Task;
    subtaskCount: number;
}

export default function TaskHeader({ task, subtaskCount }: Props) {
    return (
        <div className={styles.row}>
            <span className={styles.name}>
                {task.name}
                {subtaskCount > 0 && <span className={styles.count}>{subtaskCount}</span>}
            </span>
            <span className={styles.status} data-status={task.status}>{task.status}</span>
            <span>{task.assignee ?? "–"}</span>
            <span>{task.due_date ? new Date(task.due_date).toLocaleDateString("de-DE") : "–"}</span>
        </div>
    );
}