'use client';

import { fetchRechnungsposten } from "@/app/actions/invoiceitem";
import { createKunde, fetchKundeById, fetchKundenByTeam, updateKunde } from "@/app/actions/kunden";
import { saveInvoice } from "@/app/actions/rechnung";
import { adminCreateInvoice } from "@/app/actions/stripe";
import { userLookup, usersLoadByRole } from "@/app/actions/users";
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
import { formatCurrency, toDateString } from "@/app/utils/formats";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Toast } from "primereact/toast";
import { useEffect, useRef, useState } from "react";
import Column from "../../layout/Column";

interface Props {
    admin?: boolean;
    header?: string;
    rechnung?: Rechnung;
}
export default function RechnungEditor({ admin = false, header = 'Neue Rechnung erstellen', rechnung }: Props) {
    const { team, user, userProfile } = useAuth();
    const router = useRouter();

    const idempotencyKey = useRef(crypto.randomUUID());

    // IMPORTS
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
    const [steuersatz, setSteuersatz] = useState(0.19);
    const [strasse, setStrasse] = useState('');
    const [ust, setUst] = useState('');

    useEffect(() => {
        if (!rechnung) return;
        const setData = async () => {
            const posten = await fetchRechnungsposten(rechnung.id);
            setItems(posten);
            setHausnummer(rechnung.hausnummer || '');
            setOrt(rechnung.ort || '');
            setPlz(rechnung.plz || '');
            setSelectedUser(String(rechnung.mandant));
            setStrasse(rechnung.strasse || '');
        }
        setData();
    }, [rechnung])

    // SELECTIONS
    const [selectedKunde, setSelectedKunde] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState('');

    // STATES
    const [preiseInklusive, setPreiseInklusive] = useState(rechnung?.preise_inklusive ?? false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!team) return;
        const fetchData = async () => {
            const res = await fetchKundenByTeam(team.id);
            setKunden(res);
        }
        fetchData();
    }, [team])

    useEffect(() => {
        if (userProfile?.rolle != 'admin') return;
        const fetchUsers = async () => {
            const res = await usersLoadByRole('client');
            setUsers(res);
        }
        fetchUsers();
    }, [userProfile])

    useEffect(() => {
        if (!selectedKunde) return;
        const fetchData = async () => {
            const res = await fetchKundeById(selectedKunde);
            setEmail(res.email);
            setHausnummer(res.hausnummer);
            setLand(res.land);
            setName(res.name);
            setOrt(res.ort);
            setPlz(res.plz);
            setStrasse(res.strasse);
            setUst(res.ust);
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
    const tempNetto = positions.reduce((sum, p) => sum + p.gesamtpreis, 0);
    const invoiceNetto = items.reduce((sum, p) => sum + p.gesamtpreis, 0)

    const summe = Math.round(positions.reduce((s, p) => s + p.gesamtpreis, 0) * 100) / 100;
    const netto = preiseInklusive ? Math.round((summe / (1 + steuersatz)) * 100) / 100 : summe;
    const steuern = preiseInklusive
        ? Math.round((summe - netto) * 100) / 100
        : Math.round(summe * steuersatz * 100) / 100;
    const brutto = Math.round((netto + steuern) * 100) / 100;

    const clients = users.map((a) => ({
        ...a,
        fullName: `${a.nachname}, ${a.vorname}`,
    })).sort((a: User, b: User) => a.nachname.localeCompare(b.nachname));

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
        if (!userProfile) return;
        setSaving(true);

        const payload = {
            betrag_gesamt: brutto,
            betrag_netto: netto,
            betrag_steuern: steuern,
            bezahlziel: toDateString(bezahlziehl),
            created_by: userProfile.id,
            kunde: Number(selectedKunde) || null,
            rechnungsdatum: toDateString(rechnungsdatum),
            rechnungsnummer,
            steuersatz,
            team: team?.id,
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
        try {
            selectedKunde ? await updateKunde(payload, selectedKunde) : await createKunde(payload);
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

    const adminMode = userProfile?.rolle == 'admin'

    return (
        <div className="content-wrapper" style={{ height: '100%', padding: 16, paddingBottom: 120 }}>
            <Toast ref={toast} />
            <Row justifyContent="space-between">
                <h1>{header}</h1>
                <Row gap={8}>
                    {adminMode && <Button label="Aktionen" />}
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
                            <DatePicker label="Rechnungsdatum" onChange={setRechnungsdatum} value={rechnungsdatum} />
                        </>
                    )}
                </Grid>
            </DashboardContainer>
            <DividerBlock height={1} />
            <DashboardContainer>
                <h2>Kunde/Empfänger</h2>
                <DividerBlock height={1} />
                <Grid columns={2} gap={16}>
                    {adminMode ? <SelectLabel filter label="Kunde" onChange={setSelectedUser} optionLabel="fullName" optionValue="id" options={clients} value={selectedUser} /> : <SelectLabel filter label="Kunde" onChange={setSelectedKunde} optionLabel="name" optionValue="id" options={kunden} value={selectedKunde} />}
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
                                mode={!preiseInklusive ? 'secondary' : 'tertiary'}
                                onClick={() => setPreiseInklusive(false)}
                                size="medium"
                            />
                            <Button
                                label="inkl. USt."
                                mode={preiseInklusive ? 'secondary' : 'tertiary'}
                                onClick={() => setPreiseInklusive(true)}
                                size="medium"
                            />
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
                <RechnungspostenTabelle onDelete={removePosition} positions={rechnung ? items : positions} onPositionsChange={setPositions} />
                <DividerBlock height={1} />
                <Row justifyContent="end" gap={24}>
                    <span style={{ fontSize: 18, fontWeight: 700 }}>Zwischensumme:</span>
                    <span style={{ fontSize: 18, fontWeight: 700 }}>{formatCurrency(netto)}</span>
                </Row>
                <Row justifyContent="end" gap={24}>
                    <span style={{ fontSize: 18, fontWeight: 700 }}>Steuern:</span>
                    <span style={{ fontSize: 18, fontWeight: 700 }}>{formatCurrency(steuern)}</span>
                </Row>
                <Row justifyContent="end" gap={24}>
                    <span style={{ fontSize: 18, fontWeight: 700 }}>Gesamt:</span>
                    <span style={{ fontSize: 18, fontWeight: 700 }}>{formatCurrency(brutto)}</span>
                </Row>
            </DashboardContainer>
        </div>
    );
}
