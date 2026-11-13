"use client"

import TextInput from "@/app/components/inputs/TextInput";
import Column from "@/app/components/layout/Column";
import { useAuth } from "@/app/context/AuthContext";
import { useEffect, useState } from "react";
import Button from "../../buttons/Button";
import Row from "../../layout/Row";
import { Dialog } from "primereact/dialog";

export default function ProfileEditor() {
    const { userProfile } = useAuth();

    // INPUTS
    const [avatar, setAvatar] = useState('');
    const [email, setEmail] = useState('');
    const [nachname, setNachname] = useState('');
    const [password, setPassword] = useState('');
    const [passwordRepeat, setPasswordRepeat] = useState('');
    const [vorname, setVorname] = useState('');

    // STATES
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

    }

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