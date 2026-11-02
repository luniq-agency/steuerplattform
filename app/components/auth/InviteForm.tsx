'use client';

import styles from './Auth.module.css';
import TextInput from '../inputs/TextInput';
import { useState } from 'react';
import Button from '../buttons/Button';
import Column from '../layout/Column';
import { inviteSignUp } from '@/app/actions/auth';

interface Props {
    email: string;
}

export default function InviteForm({ email }: Props) {
    const [password, setPassword] = useState('');
    const [passwordRepeat, setPasswordRepeat] = useState('');
    const [error, setError] = useState('');
    const [info, setInfo] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const kontoAnlegen = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (password.length < 8) return setError('Das Passwort muss mindestens 8 Zeichen lang sein.');
        if (password !== passwordRepeat) return setError('Die Passwörter stimmen nicht überein.');

        setSubmitting(true);
        const result = await inviteSignUp(email, password);
        setSubmitting(false);

        if (result.error) return setError(result.error);
        if (result.needsConfirmation) return setInfo('Bitte bestätige deine E-Mail-Adresse über den Link, den wir dir geschickt haben.');
        if (result.ziel) window.location.assign(result.ziel);
    };

    if (info) return <p style={{ textAlign: 'center' }}>{info}</p>;

    return (
        <form className={styles.authForm} onSubmit={kontoAnlegen}>
            <Column>
                <h1 style={{ textAlign: 'center' }}>Willkommen bei ADVACT</h1>
                <p style={{ textAlign: 'center' }}>
                    Lege ein Passwort fest, um dein Konto für <strong>{email}</strong> zu aktivieren.
                </p>
                <TextInput label="Passwort" type="password" onChange={setPassword} value={password} />
                <TextInput label="Passwort wiederholen" type="password" onChange={setPasswordRepeat} value={passwordRepeat} />
                {error && <p className={styles.error}>{error}</p>}
                <Button
                    disabled={!password || !passwordRepeat || submitting}
                    label={submitting ? 'Konto wird angelegt …' : 'Konto aktivieren'}
                    mode="primary"
                    type="submit"
                    width="100%"
                />
            </Column>
        </form>
    );
}