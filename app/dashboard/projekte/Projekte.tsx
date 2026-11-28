"use client"

import { createProject, fetchProjects } from "@/app/actions/projects/project";
import Button from "@/app/components/buttons/Button";
import DividerBlock from "@/app/components/DividerBlock";
import { TextInputLabel } from "@/app/components/forms/FormElements";
import Row from "@/app/components/layout/Row";
import { useAuth } from "@/app/context/AuthContext";
import { Projekt } from "@/app/types/project"
import { Plus } from "lucide-react";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { SelectLabel } from "@/app/components/inputs/select/SelectLabel";
import { useEffect, useState } from "react"
import { Kunde } from "@/app/types/clients";
import { fetchKundenByTeam } from "@/app/actions/kunden";
import LayoutColumn from "@/app/components/layout/Column";

export default function Projekte() {
    const { team } = useAuth();

    // DATA
    const [projects, setProjects] = useState<Projekt[]>([]);

    // INPUTS
    const [kunde, setKunde] = useState<number | null>(null);
    const [kunden, setKunden] = useState<Kunde[]>([]);
    const [name, setName] = useState('');

    // STATES
    const [saving, setSaving] = useState(false);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (!team) return
        const fetchData = async () => {
            const [res, kundenRes] = await Promise.all([
                fetchProjects(team.id),
                fetchKundenByTeam(team.id)
            ])
            const kundenSortiert = [...kundenRes].sort((a, b) => (a.name ?? '').localeCompare(b.name ?? '', 'de'));
            setKunden(kundenSortiert);
            setProjects(res);
        }
        fetchData()
    }, [team])

    // ACTIONS
    const saveProject = async () => {
        if (!kunde) return;
        setSaving(true);
        const payload = {
            kunde: kunde,
            name,
            team: team!.id
        }
        await createProject(payload);
        setSaving(false);
        setVisible(false);
        setName('');
        setKunde(null);
        const res = await fetchProjects(team!.id);
        setProjects(res);
    }

    // TEMPLATES
    const clientTemplate = (rowData: Projekt) => {
        const kunde = kunden.find((k) => k.id == rowData.kunde);
        if (!kunde) return <span>–</span>
        return (<span>{kunde.name}</span>)
    }

    return (
        <div className="content-wrapper" style={{ height: '100%', padding: 16 }}>
            <Dialog header="Neues Projekt anlegen" onHide={() => setVisible(false)} style={{ maxWidth: 480 }} visible={visible}>
                <LayoutColumn gap={16}>
                    <TextInputLabel label="Name" onChange={setName} value={name} />
                    <SelectLabel filter label="Kunde" onChange={setKunde} optionLabel="name" optionValue="id" options={kunden} value={kunde} />
                    <Button disabled={!name || !kunde || saving} label="Projekt speichern" onClick={saveProject} width="fit-content" />
                </LayoutColumn>
            </Dialog>
            <Row alignItems="center" justifyContent="space-between">
                <h1>Projekte</h1>
                <Row alignItems="center" gap={8} width="fit-content">
                    <Button icon={Plus} label="Neues Projekt" mode="secondary" onClick={() => setVisible(true)} size="small" />
                </Row>
            </Row>
            <DividerBlock height={1} />
            <DataTable value={projects}>
                <Column field="name" header="Name" />
                <Column body={clientTemplate} header="Kunde" />
            </DataTable>
        </div>
    )
}