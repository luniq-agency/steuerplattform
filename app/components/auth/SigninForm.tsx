"use client"

import Button from "../buttons/Button";
import Column from "../layout/Column";
import { login } from "@/app/actions/auth";
import styles from "./Auth.module.css";
import TextInput from "../inputs/TextInput";
import { useState } from "react";

export default function SigninForm() {

    // INPUTS
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // STATES
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // ACTIONS
    const signIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const result = await login(email, password);
            if (result?.error) setError(result.error);
        } catch (err) {
            setError(err as any);
            setSubmitting(false);
        }
    };

    return (
        <form className={styles.authForm} onSubmit={signIn}>
            <TextInput label="E-Mail-Adresse" onChange={setEmail} mode="dark" value={email} />
            <Column alignItems="end">
                <TextInput label="Passwort" onChange={setPassword} mode="dark" type="password" value={password} />
            </Column>
            <Button disabled={!email || !password} label="Anmelden" mode="primary" type="submit" />
            <span style={{ textAlign: 'center' }}>Du hast noch keinen Account? <a href="/registrieren"><strong>Jetzt registrieren</strong></a></span>
        </form>
    )
}