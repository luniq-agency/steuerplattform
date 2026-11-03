"use client"

import { userCreate, userUpdate } from "@/app/actions/users";
import Button from "@/app/components/buttons/Button";
import DividerBlock from "@/app/components/DividerBlock";
import { DatePicker } from "@/app/components/forms/datepicker/DatePicker";
import { NumberInputLabel, TextAreaLabel, TextInputLabel } from "@/app/components/forms/FormElements";
import { SelectLabel } from "@/app/components/inputs/Select";
import DashboardContainer from "@/app/components/layout/DashboardContainer";
import Grid from "@/app/components/layout/Grid";
import Row from "@/app/components/layout/Row";
import { family_options, job_categories } from "@/app/constants/Constants";
import { useAuth } from "@/app/context/AuthContext";
import { parseDate, toDateString } from "@/app/utils/formats";
import { OverlayPanel } from "primereact/overlaypanel";
import { Toast } from "primereact/toast";
import { useEffect, useRef, useState } from "react";
import { ContextButton } from "../../buttons/Buttons";
import { Dialog } from "primereact/dialog";
import Column from "../../layout/Column";
import { IconButton } from "../../buttons/IconButton";
import { Copy } from "lucide-react";
import { sendEmail } from "@/app/actions/email";
import { User } from "@/app/types/Database";

interface Props {
    client?: User,
    header: string;
    onSave: () => void;
}

export default function MandantenEditor({ client, header, onSave }: Props) {
    const { team, user, userProfile } = useAuth();

    // IMPORTS
    const op = useRef<OverlayPanel | null>(null);
    const toast = useRef<Toast | null>(null);

    // STATES
    const [saved, setSaved] = useState<string | number>('');
    const [saving, setSaving] = useState(false);
    const [visible, setVisible] = useState(false);

    // INPUTS
    const [beruf, setBeruf] = useState('');
    const [berufsstatus, setBerufsstatus] = useState('employed');
    const [email, setEmail] = useState('');
    const [familienstand, setFamilienstand] = useState('single');
    const [geburtsdatum, setGeburtsdatum] = useState<Date | null>(null);
    const [hausnummer, setHausnummer] = useState('');
    const [iban, setIban] = useState('');
    const [kinder, setKinder] = useState(0);
    const [kundennummer, setKundennummer] = useState('');
    const [nachname, setNachname] = useState('');
    const [notizen, setNotizen] = useState('');
    const [ort, setOrt] = useState('');
    const [plz, setPlz] = useState('');
    const [steuerId, setSteuerId] = useState('');
    const [strasse, setStrasse] = useState('');
    const [telefon, setTelefon] = useState('');
    const [vorname, setVorname] = useState('');

    // INIT
    useEffect(() => {
        if (!client) return
        const setData = () => {
            setBeruf(client.beruf || '')
            setBerufsstatus(client.berufsstatus || '')
            setEmail(client.email || '')
            setFamilienstand(client.familienstand || '')
            setGeburtsdatum(parseDate(client.geburtsdatum));
            setHausnummer(client.hausnummer || '')
            setIban(client.iban || '')
            setKinder(client.kinder || 0)
            setNachname(client.nachname || '')
            setNotizen(client.notizen || '')
            setOrt(client.ort || '')
            setPlz(client.plz || '')
            setSteuerId(client.steuer_id || '')
            setStrasse(client.strasse || '')
            setTelefon(client.telefon || '')
            setVorname(client.vorname || '')
        }
        setData();
    }, [client])


    // ACTIONS
    const createClient = async () => {
        setSaving(true);
        const payload = {
            bearbeiter: userProfile?.id,
            beruf,
            berufsstatus,
            email,
            familienstand,
            geburtsdatum: toDateString(geburtsdatum),
            hausnummer,
            iban,
            kinder,
            nachname,
            notizen,
            ort,
            plz,
            rolle: 'client',
            steuer_id: steuerId,
            strasse,
            telefon,
            vorname,
        }

        const isSaved = saved || client?.id;

        try {
            if (saved || client) {
                await userUpdate(payload, Number(isSaved));
                onSave();
            } else {
                const res = await userCreate(payload);
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

    const required = vorname && nachname;

    return (
        <div className="content-wrapper" style={{ height: '100%', padding: 0 }}>
            <Dialog draggable={false} header="Neuen Mandanten anlegen" onHide={() => setVisible(false)} style={{ maxWidth: 480 }} visible={visible}>
                <p>Nach dem Anlegen des Mandanten senden wir eine Einladung an die E-Mail-Adresse.</p>
                <p>Du kannst den Link auch direkt kopieren und so an deinen Mandanten senden.</p>
                <TextInputLabel label="E-Mail" value={email} />
                <DividerBlock height={1} />
                <Column gap={4}>
                    <label>Einladungslink</label>
                    <div className="input">
                        <Row alignItems="center" gap={16}>
                            <span style={{ fontSize: 14 }}>https://app.advact.de/beitreten/{saved}</span><IconButton icon={Copy} />
                        </Row>
                    </div>
                </Column>
                <DividerBlock height={1} />
                <Row justifyContent="center">
                    <Button label="Einladung versenden" mode="secondary" size="medium" />
                </Row>
            </Dialog>
            <Row alignItems="center" justifyContent="space-between">
                <h1>{header}</h1>
                <Row gap={4} width="fit-content">
                    <Button disabled={saving || !required} label="Speichern" mode="secondary" onClick={createClient} size="small" />
                </Row>
            </Row>
            <DividerBlock height={1} />
            <DashboardContainer>
                <h2>Allgemeine Angaben</h2>
                <DividerBlock height={1} />
                <Grid columns={2} gap={16}>
                    <TextInputLabel label="Vorname" onChange={setVorname} value={vorname} />
                    <TextInputLabel label="Nachname" onChange={setNachname} value={nachname} />
                    <DatePicker label="Geburtsdatum" onChange={setGeburtsdatum} value={geburtsdatum} />
                    {!client && <TextInputLabel label="Kundennummer (optional)" onChange={setKundennummer} value={kundennummer} />}
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
                    <TextInputLabel label="E-Mail" onChange={setEmail} value={email} />
                    <TextInputLabel label="Telefon" onChange={setTelefon} value={telefon} />
                </Grid>
            </DashboardContainer>
            <DividerBlock height={1} />
            <DashboardContainer>
                <h2>Steuern & Berufsstatus</h2>
                <DividerBlock height={1} />
                <Grid columns={2} gap={16}>
                    <SelectLabel label="Berufsstatus" onChange={setBerufsstatus} optionLabel="label" optionValue="value" options={job_categories} value={berufsstatus} />
                    <TextInputLabel label="Beruf" onChange={setBeruf} value={beruf} />
                    <SelectLabel label="Familienstand" onChange={setFamilienstand} optionLabel="label" optionValue="value" options={family_options} value={familienstand} />
                    <NumberInputLabel label="Anzahl Kinder" onNumberChange={setKinder} numberValue={kinder} />
                    <TextInputLabel label="Steuer-ID" onChange={setSteuerId} value={steuerId} />
                </Grid>
            </DashboardContainer>
            <DividerBlock height={1} />
            <DashboardContainer>
                <h2>Sonstiges</h2>
                <DividerBlock height={1} />
                <TextAreaLabel label="Notizen" onChange={setNotizen} value={notizen} />
            </DashboardContainer>
        </div>
    )
}