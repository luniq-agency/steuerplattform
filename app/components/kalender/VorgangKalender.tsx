'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ticket_status } from '@/app/constants/Constants';
import { User } from '@/app/types/Database';
import { Vorgang } from '@/app/types/vorgang';
import Button from '@/app/components/buttons/Button';
import DividerBlock from '@/app/components/DividerBlock';
import Row from '@/app/components/layout/Row';
import styles from './VorgangKalender.module.css';

export type KalenderAnsicht = 'faellig' | 'erstellt';

interface Props {
    defaultAnsicht?: KalenderAnsicht;
    linkPrefix?: string;
    onSelect?: (vorgang: Vorgang) => void;
    users?: User[];
    vorgaenge: Vorgang[];
    showAnsichtToggle?: boolean;
    maxProTag?: number;
}

const WOCHENTAGE = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

// Farben je Status – an eure Werte in ticket_status anpassen
const STATUS_FARBE: Record<string, string> = {
    neu: '#579bfc',
    in_bearbeitung: '#fdab3d',
    wiedervorlage: '#a25ddc',
    geschlossen: '#c4c4c4',
};

const GESCHLOSSEN = 'geschlossen';

const tagKey = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const vorgangKey = (v: Vorgang, ansicht: KalenderAnsicht): string | null => {
    if (ansicht === 'faellig') return v.due_date ? String(v.due_date).slice(0, 10) : null;
    return v.created_at ? tagKey(new Date(v.created_at)) : null;
};

function rasterTage(monat: Date): Date[] {
    const erster = new Date(monat.getFullYear(), monat.getMonth(), 1);
    const start = new Date(erster);
    start.setDate(1 - ((erster.getDay() + 6) % 7));

    const letzter = new Date(monat.getFullYear(), monat.getMonth() + 1, 0);
    const ende = new Date(letzter);
    ende.setDate(letzter.getDate() + (6 - ((letzter.getDay() + 6) % 7)));

    const tage: Date[] = [];
    for (const d = new Date(start); d <= ende; d.setDate(d.getDate() + 1)) tage.push(new Date(d));
    return tage;
}

export default function VorgangKalender({
    vorgaenge,
    users = [],
    onSelect,
    linkPrefix = '/agentur/vorgaenge',
    defaultAnsicht = 'faellig',
    showAnsichtToggle = true,
    maxProTag = 3,
}: Props) {
    const router = useRouter();

    const [monat, setMonat] = useState(() => new Date());
    const [ansicht, setAnsicht] = useState<KalenderAnsicht>(defaultAnsicht);

    const heute = tagKey(new Date());
    const tage = useMemo(() => rasterTage(monat), [monat]);

    const proTag = useMemo(() => {
        const map = new Map<string, Vorgang[]>();
        for (const v of vorgaenge) {
            const key = vorgangKey(v, ansicht);
            if (!key) continue;
            map.set(key, [...(map.get(key) ?? []), v]);
        }
        return map;
    }, [vorgaenge, ansicht]);

    const ohneDatum =
        ansicht === 'faellig' ? vorgaenge.filter((v) => !v.due_date && v.status !== GESCHLOSSEN).length : 0;

    const userName = (id: Vorgang['created_by']) => {
        const u = users.find((c) => c.id === id);
        return u ? `${u.nachname ?? ''}, ${u.vorname ?? ''}` : '';
    };

    const oeffnen = (v: Vorgang) => (onSelect ? onSelect(v) : router.push(`${linkPrefix}/${v.id}`));

    const monatWechseln = (delta: number) => setMonat((m) => new Date(m.getFullYear(), m.getMonth() + delta, 1));

    const monatTitel = monat.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });

    // TEMPLATES
    const eventCard = (v: Vorgang, tag: string) => {
        const mandant = users.find((u) => u.id === v.user || u.id === v.created_by);
        const name = mandant ? `${mandant.nachname ?? ''}, ${mandant.vorname ?? ''}` : '–';
        const status = ticket_status.find((s) => s.value === v.status);
        const ueberfaellig = ansicht === 'faellig' && tag < heute && v.status !== GESCHLOSSEN;

        return (
            <button
                className={`${styles.eintrag} ${ueberfaellig ? styles.ueberfaellig : ''}`}
                key={v.id}
                onClick={() => oeffnen(v)}
                style={{ borderLeftColor: ueberfaellig ? '#e2445c' : STATUS_FARBE[v.status] ?? '#c4c4c4' }}
                title={[v.titel, name, status?.label].filter(Boolean).join(' · ')}
                type="button"
            >
                <span className={styles.eintragTitel}>{v.titel}</span>
                <span className={styles.eintragName}>{name}</span>
            </button>
        );
    };

    return (
        <div className={styles.wrapper}>
            {/* Kopfzeile */}
            <Row alignItems="center" justifyContent="space-between">
                <Row alignItems="center" gap={8} width="fit-content">
                    <button aria-label="Vorheriger Monat" className={styles.navButton} onClick={() => monatWechseln(-1)} type="button">
                        <ChevronLeft size={18} />
                    </button>
                    <h2 className={styles.monatTitel}>{monatTitel}</h2>
                    <button aria-label="Nächster Monat" className={styles.navButton} onClick={() => monatWechseln(1)} type="button">
                        <ChevronRight size={18} />
                    </button>
                    <Button label="Heute" mode="tertiary" onClick={() => setMonat(new Date())} size="small" />
                </Row>

                <Row alignItems="center" gap={8} width="fit-content">
                    {ohneDatum > 0 && <span className="text-meta">{ohneDatum} offen ohne Fälligkeit</span>}
                    {showAnsichtToggle && (
                        <>
                            <Button
                                label="Fälligkeit"
                                mode={ansicht === 'faellig' ? 'secondary' : 'tertiary'}
                                onClick={() => setAnsicht('faellig')}
                                size="small"
                            />
                            <Button
                                label="Erstellt am"
                                mode={ansicht === 'erstellt' ? 'secondary' : 'tertiary'}
                                onClick={() => setAnsicht('erstellt')}
                                size="small"
                            />
                        </>
                    )}
                </Row>
            </Row>
            <DividerBlock height={1} />

            {/* Raster */}
            <div className={styles.kalender}>
                {WOCHENTAGE.map((t) => (
                    <div className={styles.wochentag} key={t}>
                        {t}
                    </div>
                ))}

                {tage.map((tag) => {
                    const key = tagKey(tag);
                    const eintraege = proTag.get(key) ?? [];
                    const imMonat = tag.getMonth() === monat.getMonth();

                    return (
                        <div
                            className={[styles.tag, !imMonat && styles.fremderMonat, key === heute && styles.heute]
                                .filter(Boolean)
                                .join(' ')}
                            key={key}
                        >
                            <span className={styles.tagNummer}>{tag.getDate()}</span>
                            <div className={styles.eintraege}>
                                {eintraege.slice(0, maxProTag).map((v) => eventCard(v, key))}
                                {eintraege.length > maxProTag && (
                                    <span className={styles.mehr}>+{eintraege.length - maxProTag} weitere</span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}