'use client';

import { Calendar } from 'primereact/calendar';
import { InputText } from 'primereact/inputtext';
import { family_options, job_categories, service_options } from '@/app/constants/Constants';
import { Stepper } from 'primereact/stepper';
import { StepperPanel } from 'primereact/stepperpanel';
import { useEffect, useRef, useState } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import { clientCreateProfile } from '@/app/actions/clients';
import { redirect, useRouter } from 'next/navigation';
import { Checkbox, CheckboxChangeEvent } from 'primereact/checkbox';
import DividerBlock from '../DividerBlock';
import { useAuth } from '@/app/context/AuthContext';
import { userCreate } from '@/app/actions/users';
import { Toast } from 'primereact/toast';
import { sanitizeInput, sanitizeInputFinal } from '@/app/utils/sanitize';

export default function OnboardingClient() {
  const { user, userProfile, loading, logout } = useAuth();

  const stepperRef = useRef<Stepper | null>(null);
  const router = useRouter();

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    console.log('User:', user);
    console.log('UserProfile:', userProfile);
  });

  //CONSTRAINTS
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() - 18);

  //INPUTS
  const [city, setCity] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState<Date | null>(null);
  const [jobCategory, setJobCategory] = useState('');
  const [job, setJob] = useState('');
  const [family, setFamily] = useState('');
  const [housenumber, setHouseNumber] = useState('');
  const [kids, setKids] = useState<number | null>(null);
  const [phone, setPhone] = useState('');
  const [iban, setIban] = useState('');
  const [services, setServices] = useState<string[]>([]);
  const [street, setStreet] = useState('');
  const [taxId, setTaxId] = useState('');
  const [zip, setZip] = useState('');

  // VALIDATION
  const addressValid = city && housenumber && street && zip;

  // ACTIONS
  const completeOnboarding = async () => {
    setSubmitting(true);

    if (!user) console.error('Keine ID gefunden!!');

    const userPayload = {
      anschrift: `${street} ${housenumber}`,
      city,
      dob: dob ? dob.toISOString().split('T')[0] : '',
      email: user?.email,
      family_status: family,
      iban: iban,
      job: job,
      job_status: jobCategory,
      kinder: kids || 0,
      plz: zip,
      setup_complete: false,
      status: 'in_review',
      telefon: phone,
      user_name_first: firstName,
      user_name_last: lastName,
      user_uuid: user?.id,
      user_role: 'client',
    };

    try {
      await userCreate(userPayload);
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
    }
  };

  if (userProfile)
    switch (userProfile.user_role) {
      case 'admin':
        redirect('/admin');
      case 'agency':
        redirect('/admin');
      case 'client':
        redirect('/onboarding');
      default:
        redirect('/onboarding');
    }

  const onServiceChange = (e: CheckboxChangeEvent) => {
    let _services = [...services];

    if (e.checked) _services.push(e.value);
    else _services.splice(_services.indexOf(e.value), 1);

    setServices(_services);
  };

  return (
    <Stepper linear ref={stepperRef}>
      <StepperPanel>
        <div className="column gap-m">
          <div className="column">
            <h3>Grunddaten</h3>
            <span>Vervollständige dein CONEK-Profil.</span>
          </div>
          <InputText
            onBlur={(e) => setFirstName(sanitizeInputFinal(e.target.value))}
            onChange={(e) => setFirstName(sanitizeInput(e.target.value))}
            value={firstName}
            placeholder="Vorname"
          />
          <InputText
            onBlur={(e) => setLastName(sanitizeInputFinal(e.target.value))}
            onChange={(e) => setLastName(sanitizeInput(e.target.value))}
            value={lastName}
            placeholder="Nachname"
          />
          <Calendar
            maxDate={maxDate}
            onChange={(e) => setDob(e.value || new Date())}
            placeholder="Geburtsdatum"
            value={dob ?? maxDate}
          />
          <Dropdown
            onChange={(e) => setJobCategory(e.value)}
            options={job_categories}
            optionLabel="label"
            optionValue="value"
            placeholder="Berufsverhältnis"
            value={jobCategory}
          />
          <InputText
            onBlur={(e) => setJob(sanitizeInputFinal(e.target.value))}
            onChange={(e) => setJob(sanitizeInput(e.target.value))}
            placeholder="Beruf"
            value={job}
          />
          <Button
            disabled={!firstName || !lastName || !job || !dob}
            label="Weiter"
            onClick={() => stepperRef.current?.nextCallback()}
          />
        </div>
      </StepperPanel>
      <StepperPanel>
        <div className="column gap-m">
          <Dropdown
            onChange={(e) => setFamily(e.value)}
            options={family_options}
            optionLabel="label"
            optionValue="value"
            placeholder="Familienstand"
            value={family}
          />
          <InputNumber
            onChange={(e) => setKids(e.value || 0)}
            placeholder="Anzahl Kinder"
            value={kids}
          />
          <InputText
            onChange={(e) => setTaxId(e.target.value)}
            placeholder="Steuer-ID (optional)"
            value={taxId}
          />
          <div className="row space-between">
            <Button label="Zurück" onClick={() => stepperRef.current?.prevCallback()} />
            <Button
              disabled={!family}
              label="Weiter"
              onClick={() => stepperRef.current?.nextCallback()}
            />
          </div>
        </div>
      </StepperPanel>
      <StepperPanel>
        <div className="column gap-m">
          <InputText
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Telefonnummer"
            value={phone}
          />
          <InputText
            onChange={(e) => setIban(e.target.value)}
            placeholder="IBAN (optional)"
            value={iban}
          />
          <div className="row gap-s">
            <InputText
              onChange={(e) => setStreet(e.target.value)}
              placeholder="Strasse"
              value={street}
            />
            <InputText
              onChange={(e) => setHouseNumber(e.target.value)}
              placeholder="Nr."
              style={{ maxWidth: 80 }}
              value={housenumber}
            />
          </div>
          <div className="row gap-s">
            <InputText
              keyfilter="num"
              onChange={(e) => setZip(e.target.value)}
              placeholder="PLZ"
              value={zip}
            />
            <InputText onChange={(e) => setCity(e.target.value)} placeholder="Ort" value={city} />
          </div>
          <div className="row space-between">
            <Button label="Zurück" onClick={() => stepperRef.current?.prevCallback()} />
            <Button
              disabled={!phone || !addressValid}
              label="Weiter"
              onClick={() => stepperRef.current?.nextCallback()}
            />
          </div>
        </div>
      </StepperPanel>
      <StepperPanel>
        <div className="column gap-m">
          <div className="column">
            <h3>Wobei benötigst du Hilfe?</h3>
            <span className="text-s">
              Deine Antworten helfen uns dabei, dir den richtigen Service für deine Situation
              anbieten zu können.
            </span>
          </div>
          <div className="grid columns-two gap-xs">
            {service_options.map((m, i) => (
              <div className="row gap-xs align-center" key={i}>
                <Checkbox
                  checked={services.includes(m.label)}
                  inputId={m.label}
                  onChange={onServiceChange}
                  value={m.label}
                />
                <label className="text-s" htmlFor={m.label}>
                  {m.label}
                </label>
              </div>
            ))}
          </div>
          {services.includes('Anderes') && <InputText placeholder="Bitte angeben" />}
          <DividerBlock height={1} />
          <div className="row space-between">
            <Button label="Zurück" onClick={() => stepperRef.current?.prevCallback()} />
            <Button
              disabled={services.length === 0}
              label="Weiter"
              onClick={() => stepperRef.current?.nextCallback()}
            />
          </div>
        </div>
      </StepperPanel>
      <StepperPanel>
        <div className="column gap-m" style={{ textAlign: 'center' }}>
          <h3>Dein Profil ist ready 🚀</h3>
          <span>Du bist jetzt startbereit.</span>
          <div className="row justify-center">
            <Button
              disabled={submitting}
              icon={submitting ? 'pi pi-spinner' : undefined}
              label="Onboarding abschließen"
              onClick={completeOnboarding}
            />
          </div>
        </div>
      </StepperPanel>
    </Stepper>
  );
}
