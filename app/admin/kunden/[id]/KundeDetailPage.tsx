'use client';

import { User } from '@/app/types/Database';
import { useEffect, useRef, useState } from 'react';
import { job_categories } from '@/app/constants/Constants';
import { useRouter } from 'next/navigation';
import { Toast } from 'primereact/toast';

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

  const items = [
    { label: 'Kunden', url: '/admin/kunden' },
    { label: `${user.nachname}, ${user.vorname}` },
  ];

  const home = { icon: 'pi pi-home', url: '/admin' };
  const job = job_categories.find((t) => t.value === user.job_status);

  const handleSave = () => {
    saveRef.current?.();
    setHasChanges(false);
    toast.current?.show({
      severity: 'success',
      summary: 'Änderungen gespeichert',
      detail: 'Die Änderungen wurden erfolgreich gespeichert.',
    });
  };

  return (
    <div className="page-content column">
    
    </div>
  );
}