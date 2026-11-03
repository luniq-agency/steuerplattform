'use client';

import { User } from '@/app/types/Database';
import { useEffect, useRef, useState } from 'react';
import { job_categories } from '@/app/constants/Constants';
import { useRouter } from 'next/navigation';
import { Toast } from 'primereact/toast';
import DividerBlock from '@/app/components/DividerBlock';
import MandantenEditor from '@/app/components/agency/mandanten/MandantenEditor';

interface Props {
  bearbeiter?: User | null;
  user: User;
}

export default function KundeDetailPage({ bearbeiter, user }: Props) {
  const [hasChanges, setHasChanges] = useState(false);
  const saveRef = useRef<(() => void) | null>(null);
  const router = useRouter();
  const toast = useRef<Toast | null>(null);

  useEffect(() => {
    if (!hasChanges) return;

    const handleClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      if (!href || href.startsWith('#')) return;

      if (!href.startsWith('http')) {
        e.preventDefault();
        const confirmed = window.confirm(
          'Du hast ungespeicherte Änderungen. Möchtest du die Seite wirklich verlassen?'
        );
        if (confirmed) {
          setHasChanges(false);
          router.push(href);
        }
      }
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [hasChanges, router]);

  const save = () => {
    toast.current?.show({
      severity: 'success',
      summary: 'Kunde gespeichert',
      detail: 'Der Kunde wurde erfolgreich gespeichert.',
    });
  }

  return (
    <div className="page-content column" style={{ padding: 0 }}>
      <Toast ref={toast} />
      <MandantenEditor client={user} header={`${user.vorname} ${user.nachname}`} onSave={save} />
    </div>
  );
}