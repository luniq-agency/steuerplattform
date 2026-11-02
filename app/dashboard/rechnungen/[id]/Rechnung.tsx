'use client';

import { fetchInvoicePositions } from "@/app/actions/documents/rechnungen";
import { createKunde, fetchKundeById, updateKunde } from "@/app/actions/kunden";
import { saveInvoice } from "@/app/actions/rechnung";
import Button from "@/app/components/buttons/Button";
import { IconButton } from "@/app/components/buttons/IconButton";
import RechnungspostenTabelle from "@/app/components/clients/rechnungen/RechnungspostenTabelle";
import DividerBlock from "@/app/components/DividerBlock";
import { DatePicker } from "@/app/components/forms/datepicker/DatePicker";
import { TextInputLabel } from "@/app/components/forms/FormElements";
import { SelectLabel } from "@/app/components/inputs/Select";
import DashboardContainer from "@/app/components/layout/DashboardContainer";
import Grid from "@/app/components/layout/Grid";
import Row from "@/app/components/layout/Row";
import { LAENDER_SORTIERT } from "@/app/constants/countries";
import { useAuth } from "@/app/context/AuthContext";
import { Kunde } from "@/app/types/clients";
import { Rechnung, TempPosten } from "@/app/types/rechnung/Rechnungen";
import { parseDate, toDateString } from "@/app/utils/formats";
import { Plus } from "lucide-react";
import { Toast } from "primereact/toast";
import { useEffect, useRef, useState } from "react";

interface Props {
  invoice: Rechnung;
}

export default function RechnungPage({ invoice }: Props) {
  const { team, user, userProfile } = useAuth();

  // IMPORTS
  const toast = useRef<Toast | null>(null);

  // DATA
  const [kunden, setKunden] = useState<Kunde[]>([]);
  const [positions, setPositions] = useState<TempPosten[]>([]);

  // INPUTS
  const [bezahlziehl, setBezahlziel] = useState<Date | null>(parseDate(invoice.bezahlziel));
  const [email, setEmail] = useState('');
  const [hausnummer, setHausnummer] = useState(invoice.hausnummer || '');
  const [id, setId] = useState('');
  const [kundennummer, setKundennummer] = useState(invoice.kundennummer || '');
  const [land, setLand] = useState(invoice.land || '');
  const [name, setName] = useState(invoice.empfaenger || '');
  const [ort, setOrt] = useState(invoice.ort || '');
  const [plz, setPlz] = useState(invoice.plz || '');
  const [rechnungsdatum, setRechnungsdatum] = useState<Date | null>(parseDate(invoice.rechnungsdatum));
  const [rechnungsnummer, setRechnungsnummer] = useState(invoice.rechnungsnummer || '');
  const [steuersatz, setSteuersatz] = useState(invoice.steuersatz || 0.19);
  const [strasse, setStrasse] = useState(invoice.strasse || '');
  const [ust, setUst] = useState(invoice.ust || '');

  // SELECTIONS
  const [selectedKunde, setSelectedKunde] = useState('');

  // STATES
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!invoice) return;
    const fetchData = async () => {
      const res = await fetchInvoicePositions(id);
      setPositions(res);
    }
    fetchData();
  }, [invoice])

  // CALCULATIONS
  const netto = positions.reduce((sum, p) => sum + p.gesamtpreis, 0);
  const steuern = Math.round(netto * steuersatz * 100) / 100;
  const brutto = netto + steuern;

  // ACTIONS
  const createInvoice = async () => {
    if (!userProfile) return;
    setSaving(true);
    const payload = {
      betrag_gesamt: brutto,
      betrag_netto: netto,
      betrag_steuern: steuern,
      bezahlziel: bezahlziehl ? toDateString(bezahlziehl) : null,
      created_by: userProfile.id,
      empfaenger: name,
      hausnummer,
      kunde: Number(selectedKunde) || null,
      land,
      ort,
      plz,
      rechnungsdatum: toDateString(rechnungsdatum),
      rechnungsnummer,
      steuersatz,
      strasse,
      team: team?.id,
    };
    const result = await saveInvoice(payload, positions, invoice.id);
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

  return (
    <div className="content-wrapper" style={{ height: '100%', padding: 16 }}>
      <Toast ref={toast} />
      <Row justifyContent="space-between">
        <h1>Neue Rechnung erstellen</h1>
        <Button disabled={saving} label="Speichern" mode="secondary" onClick={createInvoice} size="small" />
      </Row>
      <DividerBlock height={1} />
      <DashboardContainer>
        <h2>Allgemeine Angaben</h2>
        <DividerBlock height={1} />
        <Grid columns={2} gap={16}>
          <TextInputLabel label="Rechnungsnummer" onChange={setRechnungsnummer} value={rechnungsnummer} />
          <DatePicker label="Rechnungsdatum" onChange={setRechnungsdatum} value={rechnungsdatum} />
        </Grid>
      </DashboardContainer>
      <DividerBlock height={1} />
      <DashboardContainer>
        <h2>Kunde/Empfänger</h2>
        <DividerBlock height={1} />
        <Grid columns={2} gap={16}>
          <SelectLabel label="Kunde" onChange={setSelectedKunde} optionLabel="name" optionValue="id" options={kunden} value={selectedKunde} />
          <div />
          <TextInputLabel label="Empfänger/Firmenname" onChange={setName} value={name} />
          <TextInputLabel label="Strasse" onChange={setStrasse} value={strasse} />
          <TextInputLabel label="Hausnr." onChange={setHausnummer} value={hausnummer} />
          <TextInputLabel label="PLZ" onChange={setPlz} value={plz} />
          <TextInputLabel label="Ort" onChange={setOrt} value={ort} />
          <SelectLabel filter label="Land" onChange={setLand} optionLabel="name" optionValue="code" options={LAENDER_SORTIERT} value={land} />
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

      </DashboardContainer>
    </div>
  );
}
