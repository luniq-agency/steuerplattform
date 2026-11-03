'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Column as TableColumn } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Toast } from 'primereact/toast';
import {
  adminCancelAbo,
  adminCreateAbo,
  adminResumeAbo,
  adminUpdateAbo,
  fetchAboRechnungen,
  type AboRechnung,
} from '@/app/actions/finance/abos';
import { subscriptionsLoad } from '@/app/actions/subscriptions/subscriptions';
import { usersLoadByRole } from '@/app/actions/users';
import Button from '@/app/components/buttons/Button';
import { IconButton } from '@/app/components/buttons/IconButton';
import RechnungspostenTabelle from '@/app/components/clients/rechnungen/RechnungspostenTabelle';
import DividerBlock from '@/app/components/DividerBlock';
import { NumberInputLabel, TextInputLabel } from '@/app/components/forms/FormElements';
import { SelectLabel } from '@/app/components/inputs/select/SelectLabel';
import DashboardContainer from '@/app/components/layout/DashboardContainer';
import Grid from '@/app/components/layout/Grid';
import Row from '@/app/components/layout/Row';
import Tag from '@/app/components/ui/Tag';
import { invoice_status } from '@/app/constants/Constants';
import type { Abonnement, AboIntervall } from '@/app/types/abos';
import type { Subscription, User } from '@/app/types/Database';
import type { TempPosten } from '@/app/types/rechnung/Rechnungen';
import { formatCurrency, formatDate } from '@/app/utils/formats';

const INTERVALL_OPTIONEN: { label: string; value: AboIntervall }[] = [
  { label: 'Monatlich', value: 'monat' },
  { label: 'Vierteljährlich', value: 'quartal' },
  { label: 'Jährlich', value: 'jahr' },
];

const INTERVALL_LABEL: Record<AboIntervall, string> = { monat: 'Monat', quartal: 'Quartal', jahr: 'Jahr' };

const ABO_STATUS: Record<Abonnement['status'], { label: string; bg: string; color: string }> = {
  entwurf: { label: 'Entwurf', bg: '#e0e0e0', color: '#333' },
  aktiv: { label: 'Aktiv', bg: '#00c875', color: '#fff' },
  gekuendigt: { label: 'Gekündigt', bg: '#fdab3d', color: '#fff' },
  beendet: { label: 'Beendet', bg: '#c4c4c4', color: '#fff' },
};

interface Props {
  abo?: Abonnement;
  header?: string;
}

export default function SubscriptionEditor({ abo, header = 'Neues Abonnement' }: Props) {
  const router = useRouter();
  const toast = useRef<Toast | null>(null);
  const idempotencyKey = useRef(crypto.randomUUID());

  const bearbeiten = !!abo;
  const beendet = abo?.status === 'beendet';

  // DATA
  const [mandanten, setMandanten] = useState<User[]>([]);
  const [rechnungen, setRechnungen] = useState<AboRechnung[]>([]);
  const [vorlagen, setVorlagen] = useState<Subscription[]>([]);

  // STATES
  const [saving, setSaving] = useState(false);

  // INPUTS: Allgemein
  const [selectedMandant, setSelectedMandant] = useState<number | null>(abo?.mandant ?? null);
  const [bezeichnung, setBezeichnung] = useState(abo?.bezeichnung ?? '');
  const [intervall, setIntervall] = useState<AboIntervall>(abo?.intervall ?? 'monat');
  const [zahlungsziel, setZahlungsziel] = useState(abo?.zahlungsziel_tage ?? 14);
  const [steuersatz] = useState(abo?.steuersatz ?? 0.19);
  const [vorlage, setVorlage] = useState('');

  // INPUTS: Empfänger
  const [email, setEmail] = useState('');
  const [strasse, setStrasse] = useState('');
  const [hausnummer, setHausnummer] = useState('');
  const [plz, setPlz] = useState('');
  const [ort, setOrt] = useState('');

  // INPUTS: Posten
  const [positions, setPositions] = useState<TempPosten[]>(abo?.positionen ?? []);

  // INIT
  useEffect(() => {
    usersLoadByRole('client').then(setMandanten);
    subscriptionsLoad().then(setVorlagen).catch(() => setVorlagen([]));
    if (abo) fetchAboRechnungen(abo.id).then(setRechnungen);
  }, [abo?.id]);

  // Empfängerdaten aus dem gewählten Mandanten übernehmen
  const mandant = mandanten.find((m) => m.id === selectedMandant) ?? null;
  useEffect(() => {
    if (!mandant) return;
    setEmail(mandant.email ?? '');
    setStrasse(mandant.strasse ?? '');
    setHausnummer(mandant.hausnummer ?? '');
    setPlz(mandant.plz ?? '');
    setOrt(mandant.ort ?? '');
  }, [mandant?.id]);

  const mandantenOptionen = mandanten
    .map((m) => ({ ...m, fullName: `${m.nachname ?? ''}, ${m.vorname ?? ''}` }))
    .sort((a, b) => (a.nachname ?? '').localeCompare(b.nachname ?? ''));

  // CALCULATIONS
  const netto = positions.reduce((sum, p) => sum + p.gesamtpreis, 0);
  const steuern = Math.round(netto * steuersatz * 100) / 100;
  const brutto = netto + steuern;

  const kannSpeichern =
    !!selectedMandant &&
    !!bezeichnung.trim() &&
    !!email.trim() &&
    positions.some((p) => p.beschreibung.trim() && p.gesamtpreis > 0);

  // VORLAGE: füllt Bezeichnung und einen Posten mit dem Nettopreis
  const vorlageWaehlen = (id: string) => {
    setVorlage(id);
    const plan = vorlagen.find((p) => String(p.id) === String(id));
    if (!plan) return;
    setBezeichnung(plan.name);
    setPositions([
      { id: crypto.randomUUID(), index: 1, beschreibung: plan.name, menge: 1, einzelpreis: plan.amount_net, gesamtpreis: plan.amount_net },
    ]);
  };

  // POSTEN
  const addPosition = () => {
    setPositions((prev) => [
      ...prev,
      { id: crypto.randomUUID(), index: prev.length + 1, beschreibung: '', menge: 1, einzelpreis: 0, gesamtpreis: 0 },
    ]);
  };

  const removePosition = (item: TempPosten) => {
    setPositions((prev) => prev.filter((p) => p.id !== item.id).map((p, i) => ({ ...p, index: i + 1 })));
  };

  // ACTIONS
  const fehler = (summary: string, detail: string) =>
    toast.current?.show({ severity: 'error', summary, detail, life: 8000 });

  const speichern = async () => {
    if (!selectedMandant) return;
    setSaving(true);

    const daten = {
      bezeichnung,
      positionen: positions,
      steuersatz,
      zahlungszielTage: zahlungsziel,
      adresse: { strasse, hausnummer, plz, ort, email },
      idempotencyKey: idempotencyKey.current,
    };

    if (abo) {
      const result = await adminUpdateAbo(abo.id, daten);
      setSaving(false);
      if (result.error) return fehler('Änderungen nicht gespeichert', result.error);

      idempotencyKey.current = crypto.randomUUID();
      toast.current?.show({
        severity: 'success',
        summary: 'Abo aktualisiert',
        detail: 'Die Änderungen gelten ab der nächsten Rechnung.',
      });
      router.refresh();
      return;
    }

    const result = await adminCreateAbo({ ...daten, mandantId: selectedMandant, intervall });
    setSaving(false);
    if (result.error) return fehler('Abo nicht gestartet', result.error);

    idempotencyKey.current = crypto.randomUUID();
    toast.current?.show({
      severity: 'success',
      summary: 'Abo gestartet',
      detail: `Die erste Rechnung wird von Stripe erstellt und an ${email} geschickt.`,
    });
    router.push(`/admin/abonnements/${result.aboId}`);
  };

  const kuendigen = async (sofort: boolean) => {
    if (!abo) return;
    const frage = sofort
      ? `Abo „${abo.bezeichnung}“ sofort beenden? Es werden keine weiteren Rechnungen erstellt.`
      : `Abo „${abo.bezeichnung}“ zum Ende der laufenden Periode kündigen?`;
    if (!window.confirm(frage)) return;

    const result = await adminCancelAbo(abo.id, sofort);
    if (result.error) return fehler('Kündigung fehlgeschlagen', result.error);
    toast.current?.show({ severity: 'success', summary: sofort ? 'Abo beendet' : 'Abo gekündigt' });
    router.refresh();
  };

  const fortsetzen = async () => {
    if (!abo) return;
    const result = await adminResumeAbo(abo.id);
    if (result.error) return fehler('Fehler', result.error);
    toast.current?.show({ severity: 'success', summary: 'Kündigung zurückgenommen' });
    router.refresh();
  };

  // TEMPLATES
  const rechnungStatusTemplate = (r: AboRechnung) => {
    const status = invoice_status.find((i) => i.value === r.status);
    return <Tag bgColor={status?.bg || 'grey'} color={status?.color || 'black'} text={status?.label || r.status || ''} />;
  };

  const statusInfo = abo ? ABO_STATUS[abo.status] : null;

  return (
    <div className="content-wrapper" style={{ height: '100%', padding: 16 }}>
      <Toast ref={toast} />

      {/* KOPF */}
      <Row alignItems="center" justifyContent="space-between">
        <Row alignItems="center" gap={12} width="fit-content">
          <h1>{bearbeiten ? abo.bezeichnung : 'Neues Abonnement'}</h1>
          {statusInfo && <Tag bgColor={statusInfo.bg} color={statusInfo.color} text={statusInfo.label} />}
        </Row>
        <Row gap={8} width="fit-content">
          {abo?.status === 'aktiv' && (
            <>
              <Button label="Kündigen" mode="tertiary" onClick={() => kuendigen(false)} size="small" />
              <Button label="Sofort beenden" mode="tertiary" onClick={() => kuendigen(true)} size="small" />
            </>
          )}
          {abo?.status === 'gekuendigt' && (
            <Button label="Kündigung zurücknehmen" mode="tertiary" onClick={fortsetzen} size="small" />
          )}
          {!beendet && (
            <Button
              disabled={saving || !kannSpeichern}
              label={saving ? 'Wird gespeichert …' : bearbeiten ? 'Änderungen speichern' : 'Abo starten'}
              mode="secondary"
              onClick={speichern}
              size="small"
            />
          )}
        </Row>
      </Row>

      {abo && (
        <>
          <DividerBlock height={0.5} />
          <span className="text-meta">
            {abo.startdatum && `Gestartet am ${formatDate(abo.startdatum)} · `}
            {abo.status === 'aktiv' && abo.naechste_rechnung && `Nächste Rechnung am ${formatDate(abo.naechste_rechnung)}`}
            {abo.status === 'gekuendigt' && abo.gekuendigt_zum && `Endet am ${formatDate(abo.gekuendigt_zum)}`}
            {abo.status === 'beendet' && abo.gekuendigt_zum && `Beendet am ${formatDate(abo.gekuendigt_zum)}`}
          </span>
        </>
      )}
      <DividerBlock height={1} />

      {/* ALLGEMEIN */}
      <DashboardContainer>
        <h2>Allgemeine Angaben</h2>
        <DividerBlock height={1} />
        <Grid columns={2} gap={16}>
          {bearbeiten ? (
            <TextInputLabel
              label="Mandant"
              value={mandant ? `${mandant.vorname ?? ''} ${mandant.nachname ?? ''}`.trim() : '…'}
              readonly
            />
          ) : (
            <SelectLabel
              filter
              label="Mandant"
              onChange={(v: string) => setSelectedMandant(Number(v))}
              optionLabel="fullName"
              optionValue="id"
              options={mandantenOptionen}
              value={selectedMandant ?? null}
            />
          )}
          {!bearbeiten && vorlagen.length > 0 ? (
            <SelectLabel
              label="Vorlage (optional)"
              onChange={vorlageWaehlen}
              optionLabel="displayLabel"
              optionValue="id"
              options={vorlagen.map((p) => ({ ...p, displayLabel: `${p.name} (${formatCurrency(p.amount_net)} netto)` }))}
              value={vorlage}
            />
          ) : (
            <div />
          )}
          <TextInputLabel label="Bezeichnung" onChange={setBezeichnung} value={bezeichnung} />
          {bearbeiten ? (
            <TextInputLabel label="Abrechnung" value={INTERVALL_OPTIONEN.find((o) => o.value === intervall)?.label ?? ''} readonly />
          ) : (
            <SelectLabel
              label="Abrechnung"
              onChange={(v: string) => setIntervall(v as AboIntervall)}
              optionLabel="label"
              optionValue="value"
              options={INTERVALL_OPTIONEN}
              value={intervall}
            />
          )}
          <NumberInputLabel label="Zahlungsziel (Tage)" numberValue={zahlungsziel} onNumberChange={setZahlungsziel} />
        </Grid>
      </DashboardContainer>
      <DividerBlock height={1} />

      {/* EMPFÄNGER */}
      <DashboardContainer>
        <h2>Rechnungsempfänger</h2>
        <DividerBlock height={1} />
        <Grid columns={2} gap={16}>
          <TextInputLabel label="E-Mail" onChange={setEmail} value={email} />
          <div />
          <TextInputLabel label="Straße" onChange={setStrasse} value={strasse} />
          <TextInputLabel label="Hausnr." onChange={setHausnummer} value={hausnummer} />
          <TextInputLabel label="PLZ" onChange={setPlz} value={plz} />
          <TextInputLabel label="Ort" onChange={setOrt} value={ort} />
        </Grid>
      </DashboardContainer>
      <DividerBlock height={1} />

      {/* POSTEN */}
      <DashboardContainer>
        <Row justifyContent="space-between">
          <h2>Posten pro {INTERVALL_LABEL[intervall]}</h2>
          {!beendet && <IconButton icon={Plus} onClick={addPosition} round />}
        </Row>
        <DividerBlock height={1} />
        <RechnungspostenTabelle onDelete={removePosition} onPositionsChange={setPositions} positions={positions} />
        <DividerBlock height={1} />
        <span className="text-meta">
          Netto {formatCurrency(netto)} · USt. {Math.round(steuersatz * 100)} % {formatCurrency(steuern)} · Gesamt{' '}
          {formatCurrency(brutto)} pro {INTERVALL_LABEL[intervall]}
        </span>
        {bearbeiten && !beendet && (
          <>
            <DividerBlock height={0.5} />
            <span className="text-meta">Änderungen an den Posten gelten ab der nächsten Rechnung.</span>
          </>
        )}
      </DashboardContainer>

      {/* RECHNUNGEN */}
      {abo && (
        <>
          <DividerBlock height={1} />
          <DashboardContainer>
            <h2>Rechnungen aus diesem Abo</h2>
            <DividerBlock height={1} />
            <DataTable emptyMessage="Noch keine Rechnungen." value={rechnungen}>
              <TableColumn field="rechnungsnummer" header="#" />
              <TableColumn body={(r: AboRechnung) => (r.rechnungsdatum ? formatDate(r.rechnungsdatum) : '–')} header="Datum" />
              <TableColumn body={(r: AboRechnung) => formatCurrency(r.betrag_gesamt)} header="Betrag" />
              <TableColumn body={rechnungStatusTemplate} header="Status" />
              <TableColumn
                body={(r: AboRechnung) =>
                  r.stripe_url ? (
                    <a href={r.stripe_url} rel="noreferrer" target="_blank">
                      Ansehen
                    </a>
                  ) : null
                }
                header=""
              />
            </DataTable>
          </DashboardContainer>
        </>
      )}
    </div>
  );
}