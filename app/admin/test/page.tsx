'use client';

import { migrateToStripe } from '@/app/actions/migrate';
import { updateStripeCustomers } from '@/app/actions/stripe';
import Column from '@/app/components/layout/Column';
import { Button } from 'primereact/button';

export default function Test() {
  const check = async () => {
    const res = await migrateToStripe();
    console.log('Ergebnis:', res);
  };

  const update = async () => {
    const res = await updateStripeCustomers();
    console.log('Ergebnis:', res);
  };

  return (
    <Column>
      <Button label="Testen" onClick={check} />
      <Button label="Liste" onClick={update} />
    </Column>
  );
}
