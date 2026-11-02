"use client"

import { createKunde, updateKunde } from "@/app/actions/kunden";
import Button from "@/app/components/buttons/Button";
import DividerBlock from "@/app/components/DividerBlock";
import { TextInputLabel } from "@/app/components/forms/FormElements";
import { SelectLabel } from "@/app/components/inputs/Select";
import DashboardContainer from "@/app/components/layout/DashboardContainer";
import Grid from "@/app/components/layout/Grid";
import Row from "@/app/components/layout/Row";
import { LAENDER_SORTIERT } from "@/app/constants/countries";
import { useAuth } from "@/app/context/AuthContext";
import { Toast } from "primereact/toast";
import { useRef, useState } from "react";

export default function KundeNeu() {
    const { team, user, userProfile } = useAuth();

    // IMPORTS
    const toast = useRef<Toast | null>(null);

    // STATES
    const [saved, setSaved] = useState<string | number>('');
    const [saving, setSaving] = useState(false);

    // INPUTS
    const [email, setEmail] = useState('');
    const [hausnummer, setHausnummer] = useState('');
    const [kundennummer, setKundennummer] = useState('');
    const [land, setLand] = useState('');
    const [name, setName] = useState('');
    const [ort, setOrt] = useState('');
    const [plz, setPlz] = useState('');
    const [strasse, setStrasse] = useState('');
    const [ust, setUst] = useState('');

    // ACTIONS
    const createClient = async () => {
        setSaving(true);
        const payload = {
            created_by: userProfile?.id,
            email,
            hausnummer,
            land,
            name,
            ort,
            plz,
            strasse,
            team: team?.id,
            ust
        }

        if (!saved) try {
            const res = await createKunde(payload);
            setSaved(res.id);
            toast.current?.show({
                severity: 'success',
                summary: 'Kunde gespeichert',
                detail: 'Der Kunde wurden erfolgreich gespeichert.',
            });
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }

        if (saved) try {
            await updateKunde(payload, saved)
        }
            catch (err) {
                console.error(err);
            } finally {
            setSaving(false);
        }
    }

    return (
        <div className="content-wrapper" style={{ height: '100%', padding: 16 }}>
            <Row alignItems="center" justifyContent="space-between">
                <h1>Neuen Kunden anlegen</h1>
                <Button disabled={saving} label="Speichern" mode="secondary" onClick={createClient} size="small" />
            </Row>
            <DividerBlock height={1} />
            <DashboardContainer>
                <h2>Allgemeine Angaben</h2>
                <DividerBlock height={1} />
                <Grid columns={2} gap={16}>
                    <TextInputLabel label="Name" onChange={setName} value={name} />
                    <TextInputLabel label="E-Mail" onChange={setEmail} value={email} />
                    <TextInputLabel label="Kundennummer" onChange={setKundennummer} value={kundennummer} />
                    <TextInputLabel label="Umsatzsteuer-Identifikationsnummer" onChange={setUst} value={ust} />
                </Grid>
            </DashboardContainer>
            <DividerBlock height={1} />
            <DashboardContainer>
                <h2>Anschrift</h2>
                <DividerBlock height={1} />
                <Grid columns={2} gap={16}>
                    <SelectLabel filter label="Land" onChange={setLand} optionLabel="name" optionValue="code" options={LAENDER_SORTIERT} value={land} />
                    <TextInputLabel label="Strasse" onChange={setStrasse} value={strasse} />
                    <TextInputLabel label="Hausnummer" onChange={setHausnummer} value={hausnummer} />
                    <TextInputLabel label="PLZ" onChange={setPlz} value={plz} />
                    <TextInputLabel label="Ort" onChange={setOrt} value={ort} />
                </Grid>
            </DashboardContainer>
        </div>
    )
}