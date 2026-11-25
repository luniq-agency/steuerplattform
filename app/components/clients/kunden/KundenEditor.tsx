"use client"

import { userCreate, userUpdate } from "@/app/actions/users";
import Button from "@/app/components/buttons/Button";
import DividerBlock from "@/app/components/DividerBlock";
import { DatePicker } from "@/app/components/forms/datepicker/DatePicker";
import { NumberInputLabel, TextAreaLabel, TextInputLabel } from "@/app/components/forms/FormElements";
import { SelectLabel } from "@/app/components/inputs/select/SelectLabel";
import DashboardContainer from "@/app/components/layout/DashboardContainer";
import Grid from "@/app/components/layout/Grid";
import Row from "@/app/components/layout/Row";
import { family_options, job_categories } from "@/app/constants/Constants";
import { useAuth } from "@/app/context/AuthContext";
import { parseDate, toDateString } from "@/app/utils/formats";
import { OverlayPanel } from "primereact/overlaypanel";
import { Toast } from "primereact/toast";
import { useEffect, useRef, useState } from "react";
import { User } from "@/app/types/Database";
import { LAENDER_SORTIERT } from "@/app/constants/countries";
import { createKunde, updateKunde } from "@/app/actions/kunden";

interface Props {
    client?: User,
    header: string;
    onSave: () => void;
}

export default function KundenEditor({ client, header, onSave }: Props) {
    const { team, user, userProfile } = useAuth();

    // IMPORTS
    const op = useRef<OverlayPanel | null>(null);
    const toast = useRef<Toast | null>(null);

    // STATES
    const [saved, setSaved] = useState<string | number>('');
    const [saving, setSaving] = useState(false);
    const [visible, setVisible] = useState(false);

    // INPUTS
    const [ansprechpartner, setAnsprechpartner] = useState('');
    const [email, setEmail] = useState('');
    const [hausnummer, setHausnummer] = useState('');
    const [kundennummer, setKundennummer] = useState('');
    const [land, setLand] = useState('');
    const [name, setName] = useState('');
    const [ort, setOrt] = useState('');
    const [plz, setPlz] = useState('');
    const [strasse, setStrasse] = useState('');
    const [telefon, setTelefon] = useState('');
    const [ust, setUst] = useState('');

    // INIT
    useEffect(() => {
        if (!client) return
        const setData = () => {
            setEmail(client.email || '')
            setHausnummer(client.hausnummer || '')
            setOrt(client.ort || '')
            setPlz(client.plz || '')
            setStrasse(client.strasse || '')
            setTelefon(client.telefon || '')
        }
        setData();
    }, [client])

    // ACTIONS
    const createClient = async () => {
        setSaving(true);
        const payload = {
            ansprechpartner,
            email,
            hausnummer,
            kundennummer,
            land,
            name,
            ort,
            plz,
            strasse,
            team: team?.id,
            telefon,
            ust
        }

        const isSaved = saved || client?.id;

        try {
            if (saved || client) {
                await updateKunde(payload, Number(isSaved));
                onSave();
            } else {
                const res = await createKunde(payload);
                setSaved(res.id);
                onSave();
            }
        } catch (err) {
            console.error(err);
            toast.current?.show({
                severity: 'error',
                summary: 'Speichern fehlgeschlagen',
                detail: 'Der Mandant konnte nicht gespeichert werden.',
            });
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="content-wrapper" style={{ minHeight: '100%', overflowY: 'auto', padding: '16px 16px 200px 16px' }}>
            <Row alignItems="center" justifyContent="space-between">
                <h1>{header}</h1>
                <Row gap={4} width="fit-content">
                    <Button disabled={saving} label="Speichern" mode="secondary" onClick={createClient} size="small" />
                </Row>
            </Row>
            <DividerBlock height={1} />
            <DashboardContainer>
                <h2>Allgemeine Angaben</h2>
                <DividerBlock height={1} />
                <Grid columns={2} gap={16}>
                    <TextInputLabel label="Name" onChange={setName} value={name} />
                    <TextInputLabel label="Kundennummer (optional)" onChange={setKundennummer} value={kundennummer} />
                    <TextInputLabel label="Ust.-Nr." onChange={setUst} value={ust} />
                </Grid>
            </DashboardContainer>
            <DividerBlock height={1} />
            <DashboardContainer>
                <h2>Anschrift & Kontakt</h2>
                <DividerBlock height={1} />
                <Grid columns={2} gap={16}>
                    <TextInputLabel label="Strasse" onChange={setStrasse} value={strasse} />
                    <TextInputLabel label="Hausnummer" onChange={setHausnummer} value={hausnummer} />
                    <TextInputLabel label="PLZ" onChange={setPlz} value={plz} />
                    <TextInputLabel label="Ort" onChange={setOrt} value={ort} />
                    <SelectLabel filter label="Land" onChange={setLand} optionLabel="name" optionValue="code" options={LAENDER_SORTIERT} value={land} />
                    <TextInputLabel label="E-Mail" onChange={setEmail} value={email} />
                    <TextInputLabel label="Telefon" onChange={setTelefon} value={telefon} />
                </Grid>
            </DashboardContainer>
        </div>
    )
}