'use client';

import { fetchRechnungsposten } from "@/app/actions/invoiceitem";
import { createKunde, fetchKundeById, fetchKundenByTeam, updateKunde } from "@/app/actions/kunden";
import { saveInvoice } from "@/app/actions/rechnung";
import { adminCreateInvoice } from "@/app/actions/stripe";
import { userCreate, userLookup, usersLoadByRole, userUpdate } from "@/app/actions/users";
import Button from "@/app/components/buttons/Button";
import { IconButton } from "@/app/components/buttons/IconButton";
import RechnungspostenTabelle from "@/app/components/clients/rechnungen/RechnungspostenTabelle";
import DividerBlock from "@/app/components/DividerBlock";
import { DatePicker } from "@/app/components/forms/datepicker/DatePicker";
import { TextInputLabel } from "@/app/components/forms/FormElements";
import { SelectLabel } from "@/app/components/inputs/select/SelectLabel";
import DashboardContainer from "@/app/components/layout/DashboardContainer";
import Grid from "@/app/components/layout/Grid";
import Row from "@/app/components/layout/Row";
import { LAENDER_SORTIERT } from "@/app/constants/countries";
import { useAuth } from "@/app/context/AuthContext";
import { Kunde } from "@/app/types/clients";
import { User } from "@/app/types/Database";
import { Rechnung, Rechnungsposten, TempPosten } from "@/app/types/rechnung/Rechnungen";
import { formatCurrency, parseDate, toDateString } from "@/app/utils/formats";
import { Plus, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { Toast } from "primereact/toast";
import { useEffect, useRef, useState } from "react";
import Column from "../../layout/Column";
import { OverlayPanel } from "primereact/overlaypanel";
import { ContextButton } from "../../buttons/Buttons";
import { Dialog } from "primereact/dialog";
import { invoiceDelete } from "@/app/actions/invoice";
import { invoice_status } from "@/app/constants/Constants";

const rechnungTypes = [
    {
        label: 'Gutschrift',
        value: 'gutschrift',
    },
    {
        label: 'Rechnung',
        value: 'rechnung'
    }
]

interface Props {
    admin?: boolean;
    header?: string;
    mandant?: User;
    rechnung?: Rechnung;
}

export default function RechnungEditor({ admin = false, header = 'Neue Rechnung erstellen', rechnung, mandant }: Props) {
    const { team, user, userProfile } = useAuth();
    const router = useRouter();

    const idempotencyKey = useRef(crypto.randomUUID());

    const path = admin ? 'admin' : 'dashboard/finanzen';

    const adminMode = admin || userProfile?.rolle === 'admin';

    // IMPORTS
    const op = useRef<OverlayPanel | null>(null)
    const toast = useRef<Toast | null>(null);

    // DATA
    const [items, setItems] = useState<Rechnungsposten[]>([]);
    const [kunden, setKunden] = useState<Kunde[]>([]);
    const [positions, setPositions] = useState<TempPosten[]>([]);
    const [users, setUsers] = useState<User[]>([]);

    // INPUTS
    const [bezahlziehl, setBezahlziel] = useState<Date | null>(null);
    const [email, setEmail] = useState('');
    const [hausnummer, setHausnummer] = useState('');
    const [id, setId] = useState('');
    const [kundennummer, setKundennummer] = useState('');
    const [land, setLand] = useState('');
    const [name, setName] = useState('');
    const [ort, setOrt] = useState('');
    const [plz, setPlz] = useState('');
    const [rechnungsdatum, setRechnungsdatum] = useState<Date | null>(null);
    const [rechnungsnummer, setRechnungsnummer] = useState('');
    const [status, setStatus] = useState('draft');
    const [steuersatz, setSteuersatz] = useState(0.19);
    const [strasse, setStrasse] = useState('');
    const [type, setType] = useState('rechnung');
    const [ust, setUst] = useState('');

    // INIT
    useEffect(() => {
        if (!rechnung) return;
        const setData = async () => {
            const posten = await fetchRechnungsposten(rechnung.id);
            setPositions(
                posten.map((p, i) => ({
                    id: String(p.id),
                    index: i + 1,
                    beschreibung: p.beschreibung ?? '',
                    menge: Number(p.menge) || 0,
                    einzelpreis: Number(p.einzelpreis) || 0,
                    gesamtpreis: Number(p.gesamtpreis) || 0,
                }))
            );
            setId(String(rechnung.id));
            setBezahlziel(parseDate(rechnung.bezahlziel));
            setHausnummer(rechnung.hausnummer || '');
            setOrt(rechnung.ort || '');
            setPlz(rechnung.plz || '');
            setPreiseInklusive(rechnung.preise_inklusive ?? false);
            setRechnungsdatum(parseDate(rechnung.rechnungsdatum));
            setRechnungsnummer(rechnung.rechnungsnummer || '');
            setSelectedKunde(rechnung.kunde ? (rechnung.kunde) : null);
            if (rechnung.mandant) setSelectedUser(Number(rechnung.mandant));
            setStatus(rechnung.status);
            setSteuersatz(rechnung.steuersatz != null ? Number(rechnung.steuersatz) : 0.19);
            setStrasse(rechnung.strasse || '');
            setType(rechnung.kategorie || 'rechnung');
        };
        setData();
    }, [rechnung]);

    // SELECTIONS
    const [selectedKunde, setSelectedKunde] = useState<number | null>(null);
    const [selectedUser, setSelectedUser] = useState<number | null>(mandant?.id ?? null);

    // STATES
    const [preiseInklusive, setPreiseInklusive] = useState(rechnung?.preise_inklusive ?? false);
    const [saving, setSaving] = useState(false);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (admin || !team?.id) return;
        const fetchData = async () => {
            const res = await fetchKundenByTeam(team?.id || 0);
            setKunden(res);
            console.log("Firmen:", res)
        }
        fetchData();
    }, [admin, team?.id]);

    useEffect(() => {
        if (!adminMode) return;
        const fetchUsers = async () => {
            const res = await usersLoadByRole('client');
            setUsers(res ?? []);
        };
        fetchUsers();
    }, [adminMode]);

    useEffect(() => {
        if (!selectedKunde) return;
        const fetchData = async () => {
            const res = await fetchKundeById(selectedKunde);
            setEmail(res.email || '');
            setHausnummer(res.hausnummer || '');
            setLand(res.land || '');
            setName(res.name || '');
            setOrt(res.ort || '');
            setPlz(res.plz || '');
            setStrasse(res.strasse || '');
            setUst(res.ust || '');
        }
        fetchData();
    }, [selectedKunde])

    useEffect(() => {
        if (!selectedUser) return;
        const fetchData = async () => {
            const res = await userLookup(Number(selectedUser));
            setEmail(res.email || '');
            setHausnummer(res.hausnummer || '');
            setOrt(res.ort || '');
            setPlz(res.plz || '');
            setStrasse(res.strasse || '');
        }
        fetchData();
    }, [selectedUser])

    // CALCULATIONS
    const summe = Math.round(positions.reduce((s, p) => s + p.gesamtpreis, 0) * 100) / 100;
    const netto = preiseInklusive ? Math.round((summe / (1 + steuersatz)) * 100) / 100 : summe;
    const steuern = preiseInklusive
        ? Math.round((summe - netto) * 100) / 100
        : Math.round(summe * steuersatz * 100) / 100;
    const brutto = Math.round((netto + steuern) * 100) / 100;

    // KUNDEN
    const clients = users.map((a) => ({
        ...a,
        fullName: `${a.nachname}, ${a.vorname}`,
    })).sort((a: User, b: User) => a.nachname.localeCompare(b.nachname));
    const kundenSortiert = [...kunden].sort((a, b) => (a.name ?? '').localeCompare(b.name ?? '', 'de'));

    // ACTIONS
    const adminCreateInvoiceHandler = async () => {
        if (userProfile?.rolle !== 'admin' || !selectedUser) return;
        setSaving(true);

        const result = await adminCreateInvoice({
            mandantId: Number(selectedUser),
            positionen: positions,
            steuersatz,
            preiseInklusive,
            bezahlziel: toDateString(bezahlziehl),
            adresse: { strasse, hausnummer, plz, ort, email },
            idempotencyKey: idempotencyKey.current,
        });
        setSaving(false);

        if (result.error) {
            toast.current?.show({ severity: 'error', summary: 'Rechnung nicht erstellt', detail: result.error, life: 8000 });
            return;
        }

        idempotencyKey.current = crypto.randomUUID();
        toast.current?.show({
            severity: 'success',
            summary: `Rechnung ${result.rechnungsnummer} versendet`,
            detail: `Die Rechnung wurde per E-Mail an ${email} geschickt.`,
        });
        router.push(`/admin/rechnungen/${result.rechnungId}`);
    };

    const createInvoice = async () => {
        if (!userProfile || !selectedKunde) return;
        setSaving(true);
        const recipient = await fetchKundeById(selectedKunde);
        const deadline =
            bezahlziehl ??
            (rechnungsdatum
                ? new Date(rechnungsdatum.getFullYear(), rechnungsdatum.getMonth(), rechnungsdatum.getDate() + 7)
                : null);
        const payload = {
            betrag_gesamt: brutto,
            betrag_netto: netto,
            betrag_steuern: steuern,
            bezahlziel: toDateString(deadline),
            created_by: userProfile.id,
            empfaenger: recipient?.name,
            hausnummer: recipient.hausnummer || '',
            kategorie: type,
            kunde: Number(selectedKunde) || null,
            land: recipient.land || '',
            ort: recipient?.ort || '',
            plz: recipient?.plz || '',
            rechnungsdatum: toDateString(rechnungsdatum),
            rechnungsnummer,
            status,
            steuersatz,
            strasse: recipient.strasse || '',
            team: team?.id,
            ust: recipient.ust || ''
        };

        const result = await saveInvoice(payload, positions, id || undefined);

        if (result.id && !id) setId(result.id);

        if (result.error) {
            console.error(result.error);
            toast.current?.show({
                severity: 'error',
                summary: 'Speichern fehlgeschlagen',
                detail: 'Die Rechnung konnte nicht gespeichert werden. Bitte überprüfe deine Eingaben und probiere es erneut.',
            });
        } else {
            toast.current?.show({
                severity: 'success',
                summary: 'Änderungen gespeichert',
                detail: 'Die Rechnung wurde erfolgreich gespeichert.',
            });
        }

        setSaving(false);
    };

    const deleteInvoice = async () => {
        if (!rechnung) return;
        await invoiceDelete(rechnung.id);
        router.push(`/${path}/rechnungen`)
    }

    const saveClient = async () => {
        const payload = {
            email,
            hausnummer,
            land,
            name,
            ort,
            plz,
            strasse
        };
        const userPayload = {
            email,
            hausnummer,
            ort,
            plz,
            strasse
        }
        try {
            selectedKunde ? await updateKunde(payload, selectedKunde) : await createKunde(payload);
            selectedUser ? await userUpdate(userPayload, selectedUser) : await userCreate(userPayload);
            toast.current?.show({
                severity: 'success',
                summary: 'Kunde gespeichert',
                detail: 'Der Kunde wurden erfolgreich gespeichert.',
            });
        } catch (err) {
            console.error(err);
        }
    }

    // POSITIONS
    const addPosition = () => {
        setPositions((prev) => [
            ...prev,
            {
                id: crypto.randomUUID(),
                index: prev.length + 1,
                beschreibung: '',
                menge: 1,
                einzelpreis: 0,
                gesamtpreis: 0,
            },
        ]);
    };

    const removePosition = (item: TempPosten) => {
        setPositions((prev) =>
            prev
                .filter((p) => p.id !== item.id)
                .map((p, i) => ({ ...p, index: i + 1 }))
        );
    };

    return (
        <div className="content-wrapper" style={{ height: '100%', padding: 16, paddingBottom: 120 }}>
            <Dialog header="Rechnung löschen" onHide={() => setVisible(false)} style={{ maxWidth: 480 }} visible={visible}>
                <Column gap={16}>
                    <span>Bist du sicher, dass du die Rechnung löschen möchtest? Das kann nicht rückgängig gemacht werden!</span>
                    <Row alignItems="center" gap={8} justifyContent="end">
                        <Button label="Abbrechen" mode="tertiary" onClick={() => setVisible(false)} />
                        <Button label="Rechnung löschen" mode="primary" onClick={deleteInvoice} />
                    </Row>
                </Column>
            </Dialog>
            <OverlayPanel ref={op}>
                <ContextButton icon={Trash} label="Rechnung löschen" onClick={() => { op.current?.hide(); setVisible(true) }} />
            </OverlayPanel>
            <Toast ref={toast} />
            <Row justifyContent="space-between">
                <h1>{header}</h1>
                <Row gap={8} width="fit-content">
                    <Button label="Aktionen" mode="tertiary" onClick={(e) => op.current?.toggle(e)} size="small" />
                    <Button
                        disabled={saving || (adminMode && (!selectedUser || positions.length === 0))}
                        label={adminMode ? (saving ? 'Wird erstellt …' : 'Erstellen & versenden') : 'Speichern'}
                        mode="secondary"
                        onClick={adminMode ? adminCreateInvoiceHandler : createInvoice}
                        size="small"
                    />
                </Row>
            </Row>
            <DividerBlock height={1} />
            <DashboardContainer>
                <h2>Allgemeine Angaben</h2>
                <DividerBlock height={1} />
                <Grid columns={2} gap={16}>
                    {adminMode ? (
                        <DatePicker label="Zahlungsziel" onChange={setBezahlziel} value={bezahlziehl} />
                    ) : (
                        <>
                            <TextInputLabel label="Rechnungsnummer" onChange={setRechnungsnummer} value={rechnungsnummer} />
                            <SelectLabel label="Rechnung/Gutschrift" onChange={setType} options={rechnungTypes} value={type} />
                            <DatePicker label="Rechnungsdatum" onChange={setRechnungsdatum} value={rechnungsdatum} />
                        </>
                    )}
                    <SelectLabel label="Status" onChange={setStatus} options={invoice_status} value={status} />
                </Grid>
            </DashboardContainer>
            <DividerBlock height={1} />
            <DashboardContainer>
                <h2>Kunde/Empfänger</h2>
                <DividerBlock height={1} />
                <Grid columns={2} gap={16}>
                    {admin ? (
                        <SelectLabel filter label="Kunde" onChange={setSelectedUser} optionLabel="fullName" optionValue="id" options={clients} value={selectedUser} />
                    ) : (
                        <SelectLabel filter label="Kunde" onChange={setSelectedKunde} optionLabel="name" optionValue="id" options={kundenSortiert} value={selectedKunde} />
                    )}
                    <TextInputLabel label="Strasse" onChange={setStrasse} value={strasse} />
                    <TextInputLabel label="Hausnr." onChange={setHausnummer} value={hausnummer} />
                    <TextInputLabel label="PLZ" onChange={setPlz} value={plz} />
                    <TextInputLabel label="Ort" onChange={setOrt} value={ort} />
                    {!adminMode && <SelectLabel filter label="Land" onChange={setLand} optionLabel="name" optionValue="code" options={LAENDER_SORTIERT} value={land} />}
                    {!adminMode && <TextInputLabel label="Umsatzsteuer-Identifikation" onChange={setUst} value={ust} />}
                    <Column gap={4}>
                        <label>Preise</label>
                        <Row gap={4} width="fit-content">
                            <Button
                                label="zzgl. USt."
                                mode={!preiseInklusive && steuersatz > 0 ? 'secondary' : 'tertiary'}
                                onClick={() => { setPreiseInklusive(false); setSteuersatz(0.19); }}
                                size="medium"
                            />
                            <Button
                                label="inkl. USt."
                                mode={preiseInklusive && steuersatz > 0 ? 'secondary' : 'tertiary'}
                                onClick={() => { setPreiseInklusive(true); setSteuersatz(0.19); }}
                                size="medium"
                            />
                            {!admin && <Button
                                label="Ohne"
                                mode={steuersatz === 0 ? 'secondary' : 'tertiary'}
                                onClick={() => { setPreiseInklusive(false); setSteuersatz(0); }}
                                size="medium"
                            />}
                        </Row>
                    </Column>
                </Grid>
                <DividerBlock height={1} />
                <Button label={selectedKunde ? 'Kunde aktualisieren' : 'Kunde speichern'} mode="secondary" onClick={saveClient} size="small" />
            </DashboardContainer>
            <DividerBlock height={1} />
            <DashboardContainer>
                <Row justifyContent="space-between">
                    <h2>Rechnungsposten</h2>
                    <IconButton icon={Plus} onClick={addPosition} round />
                </Row>
                <DividerBlock height={1} />
                <RechnungspostenTabelle onDelete={removePosition} positions={positions} onPositionsChange={setPositions} />
                <DividerBlock height={1} />
                <Row justifyContent="end" gap={24}>
                    <span style={{ fontSize: 18, fontWeight: 700 }}>Zwischensumme:</span>
                    <span style={{ fontSize: 18, fontWeight: 700, textAlign: 'right', width: 100 }}>{formatCurrency(netto)}</span>
                </Row>
                <Row justifyContent="end" gap={24}>
                    <span style={{ fontSize: 18, fontWeight: 700 }}>Steuern:</span>
                    <span style={{ fontSize: 18, fontWeight: 700, textAlign: 'right', width: 100 }}>{formatCurrency(steuern)}</span>
                </Row>
                <Row justifyContent="end" gap={24}>
                    <span style={{ fontSize: 18, fontWeight: 700 }}>Gesamt:</span>
                    <span style={{ fontSize: 18, fontWeight: 700, textAlign: 'right', width: 100 }}>{formatCurrency(brutto)}</span>
                </Row>
            </DashboardContainer>
        </div>
    );
}
