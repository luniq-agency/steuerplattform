"use client"

import { signUp, signInWithGoogle } from "@/app/actions/auth";
import styles from "./Auth.module.css";
import { useState } from "react";
import TextInput from "../inputs/TextInput";
import Button from "../buttons/Button";
import { Mail } from "lucide-react";

export default function SignUpForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordRepeat, setPasswordRepeat] = useState('');

    const [error, setError] = useState('');
    const [info, setInfo] = useState('');
    const [method, setMethod] = useState<'email' | 'google' | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const register = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== passwordRepeat) {
            setError('Die Passwörter stimmen nicht überein.');
            return;
        }
        if (password.length < 8) {
            setError('Das Passwort muss mindestens 8 Zeichen lang sein.');
            return;
        }

        setSubmitting(true);
        const result = await signUp(email, password);

        if (result?.error) {
            setError(result.error);
        } else if (result?.needsConfirmation) {
            setInfo('Fast geschafft! Bitte bestätige deine E-Mail-Adresse über den Link, den wir dir geschickt haben.');
        }
        setSubmitting(false);
    };

    const googleSignUp = async () => {
        setError('');
        setSubmitting(true);
        const result = await signInWithGoogle();
        if (result?.error) {
            setError(result.error);
            setSubmitting(false);
        }
    };

    if (info) return <p className={styles.info}>{info}</p>;

    return (
        <div className={styles.authForm}>
            <Button type="button" icon={Mail} label="Mit E-Mail registrieren" onClick={() => setMethod('email')} width="100%" />
            <Button type="button" image="/icons/google.svg" label="Mit Google registrieren" onClick={googleSignUp} disabled={submitting} width="100%" />

            {method === 'email' && (
                <form className={styles.authForm} onSubmit={register}>
                    <TextInput label="E-Mail-Adresse" onChange={setEmail} value={email} />
                    <TextInput label="Passwort" type="password" onChange={setPassword} value={password} />
                    <TextInput label="Passwort wiederholen" type="password" onChange={setPasswordRepeat} value={passwordRepeat} />
                    <Button
                        disabled={!email || !password || !passwordRepeat || submitting}
                        label={submitting ? "Wird registriert …" : "Registrieren"}
                        mode="primary"
                        type="submit"
                        width="100%"
                    />

                </form>
            )}
            {error && <p className={styles.error}>{error}</p>}
            <span style={{ textAlign: 'center' }}>Du hast schon einen Account? <a href="/"><strong>Jetzt anmelden</strong></a></span>
        </div>
    )
}