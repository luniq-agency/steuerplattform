'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar } from 'primereact/calendar';
import { Checkbox } from 'primereact/checkbox';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { InputText } from 'primereact/inputtext';
import { family_options, job_categories, service_options } from '@/app/constants/Constants';
import { useAuth } from '@/app/context/AuthContext';
import { onboardingAbschliessen } from '@/app/actions/onboarding';
import { parseDate, toDateString } from '@/app/utils/formats';
import { zielFuerRolle } from '@/app/utils/roles';
import Button from '../buttons/Button';
import DividerBlock from '../DividerBlock';
import Column from '../layout/Column';
import Row from '../layout/Row';
import Stepper from '../stepper/Stepper';
import StepTransition from '../stepper/StepTransition';
import styles from './Auth.module.css';
import Grid from '../layout/Grid';
import DecisionCard from '../cards/DecisionCard';
import { User, Users } from 'lucide-react';
import { TextInputLabel } from '../forms/FormElements';
import Loader from '../Loader';
import { ProgressSpinner } from 'primereact/progressspinner';

const SCHRITTE = ['Persönliche Daten', 'Anschrift', 'Steuern & Beruf', 'Leistungen', 'Dein ADVACT-Konto'];

function Feld({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Column gap={4}>
      <label>{label}</label>
      {children}
    </Column>
  );
}

export default function OnboardingClient() {
  const { userProfile, loading } = useAuth();
  const router = useRouter();

  // STATES
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [team, setTeam] = useState<boolean | null>(null);
  const [error, setError] = useState('');

  // CONSTRAINTS
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() - 18);

  // INPUTS
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState<Date | null>(null);
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [housenumber, setHouseNumber] = useState('');
  const [zip, setZip] = useState('');
  const [city, setCity] = useState('');
  const [jobCategory, setJobCategory] = useState('');
  const [job, setJob] = useState('');
  const [family, setFamily] = useState('');
  const [kids, setKids] = useState<number | null>(0);
  const [taxId, setTaxId] = useState('');
  const [iban, setIban] = useState('');
  const [services, setServices] = useState<string[]>([]);
  const [teamName, setTeamName] = useState('');

  // Bereits abgeschlossen → in den eigenen Bereich
  useEffect(() => {
    if (userProfile?.setup_complete) router.replace(zielFuerRolle(userProfile.rolle));
  }, [userProfile?.setup_complete]);

  // Vorhandene Angaben übernehmen (z. B. Name aus Google oder aus der Einladung)
  useEffect(() => {
    if (!userProfile) return;
    setFirstName((v) => v || userProfile.vorname || '');
    setLastName((v) => v || userProfile.nachname || '');
    setDob((v) => v ?? parseDate(userProfile.geburtsdatum));
    setPhone((v) => v || userProfile.telefon || '');
    setStreet((v) => v || userProfile.strasse || '');
    setHouseNumber((v) => v || userProfile.hausnummer || '');
    setZip((v) => v || userProfile.plz || '');
    setCity((v) => v || userProfile.ort || '');
  }, [userProfile?.id]);

  // VALIDATION pro Schritt
  const schrittGueltig: Record<number, boolean> = {
    1: !!firstName.trim() && !!lastName.trim() && !!dob,
    2: !!street.trim() && !!housenumber.trim() && /^\d{5}$/.test(zip.trim()) && !!city.trim(),
    3: !!jobCategory && !!family,
    4: true,
    5: team === false || (team === true && teamName.trim().length >= 2),
  };

  const letzterSchritt = step === SCHRITTE.length;

  // ACTIONS
  const weiter = async () => {
    setError('');
    if (!letzterSchritt) return setStep((s) => s + 1);

    setSubmitting(true);
    const result = await onboardingAbschliessen(
      {
        vorname: firstName,
        nachname: lastName,
        geburtsdatum: toDateString(dob),
        telefon: phone,
        strasse: street,
        hausnummer: housenumber,
        plz: zip,
        ort: city,
        berufsstatus: jobCategory,
        beruf: job,
        familienstand: family,
        kinder: kids ?? 0,
        steuer_id: taxId,
        iban,
      },
      team ? { modus: 'team', name: teamName } : { modus: 'einzel' }
    );

    if (result.error) {
      setError(result.error);
      setSubmitting(false);
      return;
    }
    // Neu laden, damit AuthContext das aktualisierte Profil übernimmt
    window.location.assign(result.ziel ?? '/dashboard');
  };

  const toggleService = (value: string, checked: boolean) => {
    setServices((prev) => (checked ? [...prev, value] : prev.filter((s) => s !== value)));
  };

  if (loading || !userProfile) return null;

  if (!userProfile) return (
    <div className={styles.authForm} style={{ maxWidth: 500, padding: '5rem 1rem 1rem 1rem' }}>
      <Column alignItems="center" justifyContent='center'>
        <ProgressSpinner color="var(--primary)" style={{ width: 80 }} />
        <span>Dein Profil wird eingerichtet.</span>
      </Column>
    </div>
  )

  return (
    <div className={styles.authForm} style={{ maxWidth: 500, padding: '5rem 1rem 1rem 1rem' }}>
      <Stepper labels={SCHRITTE} maxSteps={SCHRITTE.length} step={step} />
      <DividerBlock height={2} />

      <StepTransition step={step}>
        {step === 1 && (
          <Column gap={16}>
            <Feld label="Vorname">
              <InputText onChange={(e) => setFirstName(e.target.value)} value={firstName} />
            </Feld>
            <Feld label="Nachname">
              <InputText onChange={(e) => setLastName(e.target.value)} value={lastName} />
            </Feld>
            <Feld label="Geburtsdatum">
              <Calendar
                dateFormat="dd.mm.yy"
                maxDate={maxDate}
                onChange={(e) => setDob((e.value as Date) ?? null)}
                value={dob}
                viewDate={dob ?? maxDate}
              />
            </Feld>
            <Feld label="Telefon (optional)">
              <InputText onChange={(e) => setPhone(e.target.value)} type="tel" value={phone} />
            </Feld>
          </Column>
        )}

        {step === 2 && (
          <Column gap={16}>
            <Row gap={12}>
              <div style={{ flex: 3 }}>
                <Feld label="Straße">
                  <InputText onChange={(e) => setStreet(e.target.value)} value={street} />
                </Feld>
              </div>
              <div style={{ flex: 1 }}>
                <Feld label="Hausnr.">
                  <InputText onChange={(e) => setHouseNumber(e.target.value)} value={housenumber} />
                </Feld>
              </div>
            </Row>
            <Row gap={12}>
              <div style={{ flex: 1 }}>
                <Feld label="PLZ">
                  <InputText inputMode="numeric" maxLength={5} onChange={(e) => setZip(e.target.value)} value={zip} />
                </Feld>
              </div>
              <div style={{ flex: 2 }}>
                <Feld label="Ort">
                  <InputText onChange={(e) => setCity(e.target.value)} value={city} />
                </Feld>
              </div>
            </Row>
          </Column>
        )}

        {step === 3 && (
          <Column gap={16}>
            <Feld label="Berufsstatus">
              <Dropdown
                onChange={(e) => setJobCategory(e.value)}
                optionLabel="label"
                optionValue="value"
                options={job_categories}
                placeholder="Bitte wählen"
                value={jobCategory}
              />
            </Feld>
            <Feld label="Beruf (optional)">
              <InputText onChange={(e) => setJob(e.target.value)} value={job} />
            </Feld>
            <Feld label="Familienstand">
              <Dropdown
                onChange={(e) => setFamily(e.value)}
                optionLabel="label"
                optionValue="value"
                options={family_options}
                placeholder="Bitte wählen"
                value={family}
              />
            </Feld>
            <Feld label="Anzahl Kinder">
              <InputNumber max={20} min={0} onValueChange={(e) => setKids(e.value ?? 0)} value={kids} />
            </Feld>
            <Feld label="Steuer-ID (optional)">
              <InputText inputMode="numeric" maxLength={11} onChange={(e) => setTaxId(e.target.value)} value={taxId} />
            </Feld>
            <Feld label="IBAN (optional)">
              <InputText onChange={(e) => setIban(e.target.value)} value={iban} />
            </Feld>
          </Column>
        )}

        {step === 4 && (
          <Column gap={12}>
            <span>Wobei dürfen wir dich unterstützen?</span>
            {service_options.map((s) => (
              <Row alignItems="center" gap={8} key={s.label}>
                <Checkbox
                  checked={services.includes(s.label)}
                  inputId={`service-${s.label}`}
                  onChange={(e) => toggleService(s.label, !!e.checked)}
                />
                <label htmlFor={`service-${s.label}`}>{s.label}</label>
              </Row>
            ))}
          </Column>
        )}

        {step === 5 && (
          <Column alignItems="center" gap={24}>
            <Column alignItems="center" gap={8}>
              <h2>Wie möchtest du ADVACT nutzen?</h2>
            </Column>
            <Grid columns={2} gap={16}>
              <DecisionCard headline='Alleine' icon={User} onClick={() => setTeam(false)} selected={team == false} sub="Ich nutze ADVACT für mich selbst." />
              <DecisionCard headline='Als Team' icon={Users} onClick={() => setTeam(true)} selected={team == true} sub="Ich möchte ADVACT gemeinsam mit meinem Team nutzen." />
            </Grid>
            {team == true && <TextInputLabel label="Name deines Teams" onChange={setTeamName} value={teamName} />}
          </Column>
        )}
      </StepTransition>

      {error && (
        <>
          <DividerBlock height={1} />
          <p className={styles.error}>{error}</p>
        </>
      )}

      <DividerBlock height={2} />
      <Row justifyContent="space-between">
        {step > 1 ? <Button
          disabled={submitting}
          label="Zurück"
          mode="tertiary"
          onClick={() => setStep((s) => s - 1)}
        /> : <div />}
        <Button
          disabled={!schrittGueltig[step] || submitting}
          label={submitting ? 'Wird gespeichert …' : letzterSchritt ? 'Abschließen' : 'Weiter'}
          mode="primary"
          onClick={weiter}
        />
      </Row>
    </div>
  );
}