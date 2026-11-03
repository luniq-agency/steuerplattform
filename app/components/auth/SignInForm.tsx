"use client"

import Button from "../buttons/Button";
import Column from "../layout/Column";
import { login, signInWithGoogle } from "@/app/actions/auth";
import styles from "./Auth.module.css";
import TextInput from "../inputs/TextInput";
import { useEffect, useState } from "react";
import { Mail } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { redirect } from "next/navigation";
import ErrorMessage from "../ui/ErrorMessage";

export default function SignInForm() {
    const { userProfile } = useAuth();

    // REDIRECT
    useEffect(() => {
        if (!userProfile) return;
        switch (userProfile?.rolle) {
            case 'admin':
            case 'partner':
                redirect('/admin');
                break;
            case 'agency':
                redirect('/agentur');
                break;
            case 'client':
                redirect('/dashboard');
                break;
        }
    })

    // INPUTS
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // STATES
    const [error, setError] = useState('');
    const [method, setMethod] = useState<'email' | 'google' | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // ACTIONS
    const signIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const result = await login(email, password);
            if (result?.error) {
                setError(result.error);
                setSubmitting(false);
                return;
            }
            if (result?.ziel) window.location.assign(result.ziel);
        } catch (err) {
            setError(err as any);
            setSubmitting(false);
        }
    };

    const googleSignin = async () => {
        setError('');
        setSubmitting(true);
        const result = await signInWithGoogle();
        if (result?.error) {
            setError(result.error);
            setSubmitting(false);
        }
    };

    return (
        <div className={styles.authForm}>
            <Button type="button" icon={Mail} label="Mit E-Mail anmelden" onClick={() => setMethod('email')} width="100%" />
            <Button type="button" image="/icons/google.svg" label="Mit Google anmelden" onClick={googleSignin} disabled={submitting} width="100%" />
            {method === 'email' && (<form className={styles.authForm} onSubmit={signIn}>
                <TextInput label="E-Mail-Adresse" onChange={setEmail} mode="dark" value={email} />
                <Column alignItems="end">
                    <TextInput label="Passwort" onChange={setPassword} mode="dark" type="password" value={password} />
                </Column>
                <Button disabled={!email || !password} label="Anmelden" mode="secondary" type="submit" width="100%" />
            </form>)}
            <span style={{ textAlign: 'center' }}>Du hast noch keinen Account? <a href="/registrieren"><strong>Jetzt registrieren</strong></a></span>
        </div>

    )
}