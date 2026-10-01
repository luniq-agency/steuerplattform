'use client';

import { User } from '@/app/types/Database';
import ClientTabs from '@/app/components/clients/ClientTabs';
import { useEffect, useRef, useState } from 'react';
import DividerBlock from '@/app/components/DividerBlock';
import { BreadCrumb } from 'primereact/breadcrumb';
import { formatDate } from '@/app/utils/formats';
import { UserAvatarOther } from '@/app/components/UserAvatar';
import { job_categories } from '@/app/constants/Constants';
import ClientActions from '@/app/components/clients/ClientActions';
import { useRouter } from 'next/navigation';
import Row from '@/app/components/layout/Row';
import { PrimaryButton } from '@/app/components/buttons/Buttons';
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
    { label: `${user.user_name_last}, ${user.user_name_first}` },
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
      <Toast ref={toast} />
      <BreadCrumb home={home} model={items} />
      <DividerBlock height={2} />
      <div className="row space-between">
        <div className="row gap-m">
          <div style={{ width: 72 }}>
            <UserAvatarOther
              backgroundColor={job?.bg}
              color={job?.color}
              fontSize={32}
              height={72}
              user={user}
              width={72}
            />
          </div>
          <div className="column width-100">
            <h1>
              {user.user_name_last}, {user.user_name_first}
            </h1>
            <span>
              Angemeldet seit: {formatDate(user.created_at)} •{' '}
              {bearbeiter ? (
                <span>
                  Bearbeiter: {bearbeiter.user_name_first} {bearbeiter.user_name_last}
                </span>
              ) : (
                <span>Selbst registriert</span>
              )}
            </span>
          </div>
        </div>
        <Row gap={8} width="fit-content">
          {hasChanges && <PrimaryButton label="Speichern" onClick={handleSave} />}
          <ClientActions client={user} />
        </Row>
      </div>
      <DividerBlock height={2} />
      <div className="dashboard-container flex-grow">
        <ClientTabs
          onChange={(changed) => setHasChanges(changed)}
          onSaveRef={(fn) => {
            saveRef.current = fn;
          }}
          user={user}
        />
      </div>
    </div>
  );
}