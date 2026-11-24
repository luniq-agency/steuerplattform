"use client"

import { useAuth } from "@/app/context/AuthContext";
import { Toast } from "primereact/toast";
import { useEffect, useRef, useState } from "react";
import Button from "../../buttons/Button";
import Row from "../../layout/Row";
import DividerBlock from "../../DividerBlock";
import Grid from "../../layout/Grid";
import { TextInputLabel } from "../../forms/FormElements";
import { SelectLabel } from "../../inputs/Select";
import { family_options, job_categories } from "@/app/constants/Constants";
import { DatePicker } from "../../forms/datepicker/DatePicker";
import { userUpdate } from "@/app/actions/users";
import NumberInputLabel from "../../inputs/number/NumberInputLabel";
import { parseDate, toDateString } from "@/app/utils/formats";

export default function ProfilEditor() {
    const { userProfile } = useAuth();

    const toast = useRef<Toast | null>(null);

    // INPUTS
    const [beruf, setBeruf] = useState('');
    const [berufsstatus, setBerufsstatus] = useState('');
    const [familienstand, setFamilienstand] = useState('');
    const [geburtsdatum, setGeburtsdatum] = useState<Date | null>(null);
    const [iban, setIban] = useState('');
    const [kinder, setKinder] = useState(0);
    const [nachname, setNachname] = useState('');
    const [steuerId, setSteuerId] = useState('');
    const [vorname, setVorname] = useState('');

    // INIT
    useEffect(() => {
        if (!userProfile) return;
        setBeruf(userProfile.beruf || '');
        setBerufsstatus(userProfile.berufsstatus || '');
        setFamilienstand(userProfile.familienstand || '');
        setGeburtsdatum(parseDate(userProfile.geburtsdatum) || null);
        setIban(userProfile.iban || '');
        setKinder(userProfile.kinder || 0);
        setNachname(userProfile.nachname || '');
        setSteuerId(userProfile.steuer_id || '');
        setVorname(userProfile.vorname || '');
    }, [userProfile])

    // ACTIONS
    const save = async () => {
        if (!userProfile) return;
        const payload = {
            beruf,
            berufsstatus,
            familienstand,
            geburtsdatum: toDateString(geburtsdatum),
            iban: iban.replace(/\s/g, '').toUpperCase(),
            kinder,
            nachname,
            steuer_id: steuerId.replace(/\s/g, ''),
            vorname,
        };
        await userUpdate(payload, userProfile.id);
        toast.current?.show({
            severity: 'success',
            summary: 'Änderungen gespeichert',
            detail: 'Die Änderungen wurden gespeichert.',
        });
    }

    return (
        <div className="content-wrapper" style={{ height: '100%', padding: 16 }}>
            <div className="column gap-m">
                <Toast ref={toast} />
                <Row alignItems="center" justifyContent="space-between">
                    <h3>Meine Daten</h3>
                    <Button label="Speichern" mode="secondary" onClick={save} size="small" />
                </Row>
                <DividerBlock height={1} />
                <Grid columns={2} gap={16}>
                    <TextInputLabel label="Vorname" onChange={setVorname} value={vorname} />
                    <TextInputLabel label="Nachname" onChange={setNachname} value={nachname} />
                    <TextInputLabel label="Beruf" onChange={setBeruf} value={beruf} />
                    <SelectLabel
                        label="Jobverhältnis"
                        onChange={setBerufsstatus}
                        optionLabel="label"
                        optionValue="value"
                        options={job_categories}
                        value={berufsstatus}
                    />
                    <DatePicker label="Geburtsdatum" onChange={setGeburtsdatum} value={geburtsdatum} />
                    <SelectLabel
                        label="Familienstand"
                        onChange={setFamilienstand}
                        optionLabel="label"
                        optionValue="value"
                        options={family_options}
                        value={familienstand}
                    />
                    <NumberInputLabel label="Kinder" onChange={setKinder} value={kinder} />
                    <TextInputLabel label="IBAN" onChange={setIban} value={iban} />
                    <TextInputLabel label="Steuer-ID" onChange={setSteuerId} value={steuerId} />
                </Grid>
            </div>
        </div>
    )
}