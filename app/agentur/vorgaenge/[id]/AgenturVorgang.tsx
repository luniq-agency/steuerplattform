import TaskEditor from "@/app/components/admin/tasks/TaskEditor";
import DividerBlock from "@/app/components/DividerBlock";
import { Vorgang } from "@/app/types/vorgang";

interface Props {
    vorgang: Vorgang;
}

export default function AgenturVorgang({vorgang}:Props) {

    return (
        <div className="content-wrapper" style={{ height: '100%'}}>
            <h1>Vorgang</h1>
            <DividerBlock height={1}/>
            <TaskEditor task={vorgang} />
        </div>
    )
}