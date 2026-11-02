'use client';

import { createKunde, fetchKundeById, fetchKundenByTeam, updateKunde } from "@/app/actions/kunden";
import { saveInvoice } from "@/app/actions/rechnung";
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
import { TempPosten } from "@/app/types/rechnung/Rechnungen";
import { toDateString } from "@/app/utils/formats";
import { Plus } from "lucide-react";
import { Toast } from "primereact/toast";
import { useEffect, useRef, useState } from "react";

export default function RechnungNeu() {
  const { team, user, userProfile } = useAuth();

  // IMPORTS
  const toast = useRef<Toast | null>(null);

  // DATA
  const [kunden, setKunden] = useState<Kunde[]>([]);
  const [positions, setPositions] = useState<TempPosten[]>([]);

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

  // SELECTIONS
  const [selectedKunde, setSelectedKunde] = useState<string | null>(null);

  // STATES
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
          <SelectLabel filter label="Kunde" onChange={setSelectedKunde} optionLabel="name" optionValue="id" options={kunden} value={selectedKunde} />
          <TextInputLabel label="Strasse" onChange={setStrasse} value={strasse} />
          <TextInputLabel label="Hausnr." onChange={setHausnummer} value={hausnummer} />
          <TextInputLabel label="PLZ" onChange={setPlz} value={plz} />
          <TextInputLabel label="Ort" onChange={setOrt} value={ort} />
          <SelectLabel filter label="Land" onChange={setLand} optionLabel="name" optionValue="code" options={LAENDER_SORTIERT} value={land} />
          <TextInputLabel label="Umsatzsteuer-Identifikation" onChange={setUst} value={ust} />
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
