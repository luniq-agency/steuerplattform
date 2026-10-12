"use client"

import { login } from "@/app/actions/auth";
import styles from "./Auth.module.css";
import { useState } from "react";
import TextInput from "../inputs/TextInput";
import Button from "../buttons/Button";

export default function SignUpForm() {

    // INPUTS
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordRepeat, setPasswordRepeat] = useState('');

    // STATES
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // ACTIONS
    const signIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            await login(email, password);
        } catch (err) {
            setError(err as any);
            setSubmitting(false);
        }
    };

    return (
        <form className={styles.authForm} onSubmit={signIn}>
            <TextInput label="E-Mail-Adresse" onChange={setEmail} mode="dark" value={email} />
            <TextInput label="Passwort" onChange={setPassword} mode="dark" value={password} />
            <TextInput label="Passwort wiederholen" onChange={setPasswordRepeat} mode="dark" value={passwordRepeat} />
            <Button disabled={!email || !password} label="Anmelden" mode="primary" type="submit" />
            <span style={{ textAlign: 'center' }}>Du hast schon einen Account? <a href="/"><strong>Jetzt anmelden</strong></a></span>
        </form>
    )
}