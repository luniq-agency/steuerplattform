'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { User } from '@/app/types/Database';
import DividerBlock from '@/app/components/DividerBlock';
import { Rechnung } from '@/app/types/rechnung/Rechnungen';
import Row from '@/app/components/layout/Row';
import Button from '@/app/components/buttons/Button';
import { IconButton } from '@/app/components/buttons/IconButton';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import Link from 'next/link';
import Grid from '@/app/components/layout/Grid';
import StatCard from '@/app/components/cards/StatCard';
import RechnungTable from '@/app/components/invoices/RechnungTable';
import SearchBox from '@/app/components/forms/SearchBox';
import { SelectLabel } from '@/app/components/inputs/select/SelectLabel';
import { Calendar } from 'primereact/calendar';
import { useEffect, useMemo, useState } from 'react';
import { invoice_status, job_categories } from '@/app/constants/Constants';
import { rechnungsKennzahlen } from '@/app/utils/rechnungen/chart';
import { vergleiche } from '@/app/utils/vergleich';
import { zielFuerRolle } from '@/app/utils/roles';

const BERUF_OPTIONEN = [{ label: 'Alle Berufsstatus', value: '' }, ...job_categories];
const OHNE_ANGABE = 'Ohne Angabe';
const STATUS_OPTIONEN = [{ label: 'Alle Status', value: '' }, ...invoice_status];

const normalisieren = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ß/g, 'ss');

// 'YYYY-MM' aus Date oder 'YYYY-MM-DD'
const monatKey = (d: Date | string) =>
  typeof d === 'string' ? d.slice(0, 7) : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

const BEZAHLT = ['bezahlt', 'paid'];

interface Props {
  clients: User[];
  invoices?: Rechnung[];
}

export default function Rechnungen({ clients, invoices = [] }: Props) {
  const { userProfile } = useAuth();
  const router = useRouter();

  // FILTER
  const [berufFilter, setBerufFilter] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [monat, setMonat] = useState<Date | null>(new Date()); // null = alle Monate

  const monatVerschieben = (delta: number) =>
    setMonat((m) => {
      const basis = m ?? new Date();
      return new Date(basis.getFullYear(), basis.getMonth() + delta, 1);
    });

  // Kein Admin → in den eigenen Bereich
  useEffect(() => {
    if (userProfile && userProfile.rolle !== 'admin') router.replace(zielFuerRolle(userProfile.rolle));
  }, [userProfile, router]);

  const mandantMap = useMemo(() => new Map(clients.map((c) => [Number(c.id), c])), [clients]);
  const berufVon = (r: Rechnung) => mandantMap.get(Number(r.mandant))?.berufsstatus || '';

  // 1. Monat
  const imMonat = useMemo(() => {
    if (!monat) return invoices;
    const key = monatKey(monat);
    return invoices.filter((r) => r.rechnungsdatum && monatKey(r.rechnungsdatum as Date | string) === key);
  }, [invoices, monat]);

  const imBeruf = useMemo(
    () => (berufFilter ? imMonat.filter((r) => berufVon(r) === berufFilter) : imMonat),
    [imMonat, berufFilter, mandantMap]
  );

  // 2. Suche + Status
  const gefiltert = useMemo(() => {
    const begriff = normalisieren(search.trim());
    return imBeruf.filter((r) => {
      if (statusFilter && r.status !== statusFilter) return false;
      if (!begriff) return true;
      const m = mandantMap.get(Number(r.mandant));
      const text = normalisieren(
        [r.empfaenger, r.rechnungsnummer, m?.vorname, m?.nachname].filter(Boolean).join(' ')
      );
      return text.includes(begriff);
    });
  }, [imBeruf, search, statusFilter, mandantMap]);

  // STATISTIK (für den gewählten Monat bzw. alle)
  const stats = useMemo(() => {
    const summe = (liste: Rechnung[]) =>
      Math.round(liste.reduce((s, r) => s + (Number(r.betrag_gesamt) || 0), 0) * 100) / 100;
    const bezahlt = imBeruf.filter((r) => BEZAHLT.includes(String(r.status).toLowerCase()));
    const offen = imBeruf.filter((r) => !BEZAHLT.includes(String(r.status).toLowerCase()));
    return {
      anzahl: imBeruf.length,
      gesamt: summe(imBeruf),
      bezahltAnzahl: bezahlt.length,
      bezahlt: summe(bezahlt),
      offenAnzahl: offen.length,
      offen: summe(offen),
    };
  }, [imBeruf]);

  const jeBerufsstatus = useMemo(() => {
    const label = (wert: string) => job_categories.find((j) => j.value === wert)?.label ?? OHNE_ANGABE;
    const gruppen = new Map<string, { wert: string; label: string; anzahl: number; summe: number; bezahlt: number }>();

    for (const r of imMonat) {
      const wert = berufVon(r);
      const g = gruppen.get(wert) ?? { wert, label: label(wert), anzahl: 0, summe: 0, bezahlt: 0 };
      const betrag = (Number(r.betrag_gesamt) || 0) * (r.kategorie === 'gutschrift' ? -1 : 1);
      g.anzahl++;
      g.summe += betrag;
      if (BEZAHLT.includes(String(r.status).toLowerCase())) g.bezahlt += betrag;
      gruppen.set(wert, g);
    }

    const gesamt = [...gruppen.values()].reduce((s, g) => s + g.summe, 0);
    return [...gruppen.values()]
      .map((g) => ({
        ...g,
        summe: Math.round(g.summe * 100) / 100,
        bezahlt: Math.round(g.bezahlt * 100) / 100,
        anteil: gesamt ? Math.round((g.summe / gesamt) * 1000) / 10 : 0, // in %
      }))
      .sort((a, b) => b.summe - a.summe);
  }, [imMonat, mandantMap]);

  const jahr = (monat ?? new Date()).getFullYear();
  const jahresWerte = useMemo(
    () => rechnungsKennzahlen(berufFilter ? invoices.filter((r) => berufVon(r) === berufFilter) : invoices, jahr),
    [invoices, jahr, berufFilter, mandantMap]
  );

  const filterAktiv = !!search || !!statusFilter || !!berufFilter;
  const resetFilter = () => {
    setSearch('');
    setStatusFilter('');
    setBerufFilter('');
  };

  // VERGLEICH: Vormonat (gleiche Berufsstatus-Filterung)
  const vormonat = monat ? new Date(monat.getFullYear(), monat.getMonth() - 1, 1) : null;

  const statsVormonat = useMemo(() => {
    if (!vormonat) return null;
    const key = monatKey(vormonat);
    const liste = invoices.filter(
      (r) =>
        r.rechnungsdatum &&
        monatKey(r.rechnungsdatum as Date | string) === key &&
        (!berufFilter || berufVon(r) === berufFilter)
    );
    const summe = (l: Rechnung[]) =>
      Math.round(l.reduce((s, r) => s + (Number(r.betrag_gesamt) || 0), 0) * 100) / 100;
    return {
      gesamt: summe(liste),
      bezahlt: summe(liste.filter((r) => BEZAHLT.includes(String(r.status).toLowerCase()))),
      offen: summe(liste.filter((r) => !BEZAHLT.includes(String(r.status).toLowerCase()))),
    };
  }, [invoices, berufFilter, mandantMap, vormonat?.getTime()]);

  const vergleich = useMemo(() => {
    if (!statsVormonat || !vormonat) return null;
    const label = `vs. ${vormonat.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' })}`;
    return {
      gesamt: vergleiche(stats.gesamt, statsVormonat.gesamt, label),
      bezahlt: vergleiche(stats.bezahlt, statsVormonat.bezahlt, label),
      offen: vergleiche(stats.offen, statsVormonat.offen, label),
    };
  }, [stats, statsVormonat]);

  // VERGLEICH
  const vergleichJahr = vergleiche(
    jahresWerte.umsatzJahr,
    jahresWerte.umsatzVorjahr,
    `vs. ${jahr - 1} (bis ${new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })})`
  );

  const zeitraum = monat ? monat.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' }) : 'gesamt';
  console.log('Vormonat:', statsVormonat, 'Vorjahr:', jahresWerte.umsatzVorjahr);

  if (!userProfile || userProfile.rolle !== 'admin') return null;

  return (
    <div className="page-content">
      <Row alignItems="center" justifyContent="space-between">
        <h1>Rechnungen</h1>
        <Row alignItems="center" gap={8} width="fit-content">
          <IconButton icon={ChevronLeft} onClick={() => monatVerschieben(-1)} />
          <Calendar
            dateFormat="MM yy"
            locale="de"
            onChange={(e) => e.value && setMonat(e.value as Date)}
            placeholder="Alle Monate"
            value={monat}
            view="month"
          />
          <IconButton icon={ChevronRight} onClick={() => monatVerschieben(1)} />
          <Button
            label={monat ? 'Alle Monate' : 'Aktueller Monat'}
            mode="tertiary"
            onClick={() => setMonat(monat ? null : new Date())}
            size="small"
          />
          <Link href="/admin/rechnungen/neu">
            <Button icon={Plus} label="Neue Rechnung" mode="secondary" size="small" />
          </Link>
        </Row>
      </Row>
      <DividerBlock height={1} />
      <Grid columns={4}>
        <StatCard header={`Rechnungen ${zeitraum} (${stats.anzahl})`} mode="currency" value={stats.gesamt} vergleich={vergleich?.gesamt} />
        <StatCard header={`Bezahlt (${stats.bezahltAnzahl})`} mode="currency" value={stats.bezahlt} vergleich={vergleich?.bezahlt} />
        <StatCard header={`Offen (${stats.offenAnzahl})`} mode="currency" umgekehrt value={stats.offen} vergleich={vergleich?.offen} />
        <StatCard header={`Einkommen ${jahr}`} mode="currency" value={jahresWerte.umsatzJahr} vergleich={vergleichJahr} />
      </Grid>
      <DividerBlock height={1} />
      <Row alignItems="end" gap={16}>
        <div style={{ flex: 1, maxWidth: 400 }}>
          <SearchBox maxWidth={400} onChange={setSearch} value={search} />
        </div>
        <div style={{ width: 240 }}>
          <SelectLabel onChange={setStatusFilter} options={STATUS_OPTIONEN} value={statusFilter} />
        </div>
        <div style={{ width: 240 }}>
          <SelectLabel onChange={setBerufFilter} options={BERUF_OPTIONEN} value={berufFilter} />
        </div>
        {filterAktiv && <Button label="Filter zurücksetzen" mode="tertiary" onClick={resetFilter} size="small" />}
      </Row>
      <DividerBlock height={1} />
      <RechnungTable rechnungen={gefiltert} role="admin" />
    </div>
  );
}