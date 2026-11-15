"use client"

import { createClient } from "@/app/utils/supabase/client";
import TextInput from "@/app/components/inputs/TextInput";
import Column from "@/app/components/layout/Column";
import { useAuth } from "@/app/context/AuthContext";
import { useEffect, useRef, useState } from "react";
import Button from "../../buttons/Button";
import Row from "../../layout/Row";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";

const MIN_LAENGE = 8;

function passwortFehler(code?: string, message?: string) {
    switch (code) {
        case 'same_password': return 'Das neue Passwort muss sich vom alten unterscheiden.';
        case 'weak_password': return 'Das Passwort ist zu schwach. Bitte wähle ein längeres oder komplexeres Passwort.';
        case 'reauthentication_needed':
        case 'session_not_found': return 'Bitte melde dich erneut an und versuche es dann noch einmal.';
        default: return message || 'Das Passwort konnte nicht geändert werden.';
    }
}

export default function ProfileEditor() {
    const { userProfile } = useAuth();
    const toast = useRef<Toast | null>(null);

    // INPUTS
    const [avatar, setAvatar] = useState('');
    const [email, setEmail] = useState('');
    const [nachname, setNachname] = useState('');
    const [password, setPassword] = useState('');
    const [passwordRepeat, setPasswordRepeat] = useState('');
    const [vorname, setVorname] = useState('');

    // STATES
    const [fehler, setFehler] = useState('');
    const [saving, setSaving] = useState(false);
    const [visible, setVisible] = useState(false);

    // INIT
    useEffect(() => {
        if (!userProfile) return
        setAvatar(userProfile.avatar || '');
        setEmail(userProfile.email || '');
        setNachname(userProfile.nachname || '');
        setVorname(userProfile.vorname || '');
    }, [userProfile])

    // ACTIONS
    const reset = async () => {
        setSaving(true);
        setFehler('');

        const { error } = await createClient().auth.updateUser({ password });

        setSaving(false);

        if (error) {
            console.error(error);
            setFehler(passwortFehler(error.code, error.message));
            return;
        }

        toast.current?.show({
            severity: 'success',
            summary: 'Passwort geändert',
            detail: 'Dein neues Passwort ist ab sofort aktiv.',
        });
    };

    // CHECKS
    const invalid = (password !== passwordRepeat) || !password || !passwordRepeat;

    return (
        <Column gap={16}>
            <Dialog header="Neues Passwort" onHide={() => setVisible(false)} style={{ maxWidth: 400 }} visible={visible}>
                <Column gap={16}>
                    <TextInput label="Passwort" onChange={setPassword} password type="password" value={password} />
                    <TextInput label="Passwort wiederholen" onChange={setPasswordRepeat} password type="password" value={passwordRepeat} />
                    <Button disabled={invalid} label="Passwort zurücksetzen" onClick={reset} />
                </Column>
            </Dialog>
            <img height={150} src={avatar} width={150} />
            <TextInput label="Vorname" onChange={setVorname} type="text" value={vorname} />
            <TextInput label="Nachname" onChange={setVorname} value={nachname} />
            <TextInput label="E-Mail" onChange={setEmail} value={email} />
            <Column gap={4}>
                <label>Passwort</label>
                <Row gap={8}>
                    <Button label="Passwort zurücksetzen" mode="tertiary" onClick={() => setVisible(true)} />
                </Row>
            </Column>
        </Column>
    )
}