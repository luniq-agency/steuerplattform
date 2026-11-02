"use client"

import { Subtask, type Task } from "@/app/types/tasks";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { formatDate } from "@/app/utils/formats";
import { ProgressBar } from "primereact/progressbar";
import { Sidebar } from 'primereact/sidebar';
import { useEffect, useState } from "react";
import { status_options } from "@/app/constants/status";
import Button from "../buttons/Button";
import { Plus } from "lucide-react";
import DividerBlock from "../DividerBlock";
import { subtaskCreate, subtaskLoadTask, taskUpdate } from "@/app/actions/tasks/tasks";

interface Props {
    tasks: Task[];
}

export default function TaskBoard({ tasks }: Props) {
    // STATES
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [subtasks, setSubtasks] = useState<Subtask[]>([]);

    // LOADING
    useEffect(() => {
        if (!selectedTask) return;
        const fetchSubs = async () => {
            const res = await subtaskLoadTask(selectedTask.id);
            setSubtasks(res);
        }
        fetchSubs();
    }, [selectedTask])

    // HELPERS
    const getProgress = (task: Task) =>
        task.subtask_count > 0
            ? Math.round((task.subtask_completed / task.subtask_count) * 100)
            : 0;

    // ACTIONS
    const createSubTask = async () => {
        if (!selectedTask) return;
        const payload = {
            name: 'Neue Unteraufgabe',
            task: selectedTask.id
        }
        const taskPayload = {
            subtask_count: selectedTask.subtask_count + 1,
        }
        await subtaskCreate(payload);
        await taskUpdate(taskPayload, selectedTask.id);
        refresh();
    }

    const refresh = async () => {
        if (!selectedTask) return;
        const res = await subtaskLoadTask(selectedTask.id);
        setSubtasks(res);
    }

    // TEMPLATES
    const dueDateTemplate = (rowData: Task) =>
        rowData.due_date ? <span>{formatDate(rowData.due_date)}</span> : <span>–</span>;

    const progressTemplate = (rowData: Task) => (
        <ProgressBar style={{ maxWidth: 200 }} value={getProgress(rowData)} />
    );

    const statusTemplate = (rowData: Task) => {
        const status = status_options.find((s) => s.value === rowData.status);
        if (!rowData.status) return <span>–</span>
        return (
            <span>{status?.label}</span>
        )
    }

    return (
        <>
            <Sidebar
                visible={!!selectedTask}
                onHide={() => setSelectedTask(null)}
                position="right"
                header={selectedTask?.name}
                style={{ maxWidth: 1000, width: '100%' }}
            >
                {selectedTask && (
                    <div>
                        <p><strong>Status:</strong> {selectedTask.status ?? '–'}</p>
                        <p><strong>Fällig bis:</strong> {selectedTask.due_date ? formatDate(selectedTask.due_date) : '–'}</p>
                        <p><strong>Fortschritt:</strong></p>
                        <ProgressBar value={getProgress(selectedTask)} />
                        <p>
                            {selectedTask.subtask_completed} von {selectedTask.subtask_count} Subtasks erledigt
                        </p>
                        <DataTable value={subtasks}>
                            <Column field="name" header="Unteraufgabe" />
                            <Column header="Fällig bis" />
                            <Column header="Status" />
                        </DataTable>
                        <DividerBlock height={1} />
                        <Button icon={Plus} label="Unteraufgabe anlegen" onClick={createSubTask} />
                    </div>
                )}
            </Sidebar>

            <DataTable
                value={tasks}
                dataKey="id"
                selectionMode="single"
                selection={selectedTask}
                onSelectionChange={(e) => setSelectedTask(e.value as Task | null)}
                metaKeySelection={false}
                rowHover
            >
                <Column field="name" header="Aufgabe" />
                <Column body={statusTemplate} field="status" header="Status" />
                <Column body={progressTemplate} header="Fortschritt" />
                <Column body={dueDateTemplate} header="Fällig bis" />
            </DataTable>
        </>
    )
}