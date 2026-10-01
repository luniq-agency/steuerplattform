'use client';

import styles from '../admin/Admin.module.css';
import AdminSidebarButton from '../admin/AdminSidebarButton';
import DividerBlock from '../DividerBlock';
import Image from 'next/image';
import { useAuth } from '@/app/context/AuthContext';
import NotificationButton from '../notifications/NotificationButton';
import { UserAvatar } from '../UserAvatar';

export default function AdminSidebar() {
  const { user, userProfile, logout } = useAuth();

  if (!userProfile) return;

  return (
    <div className={styles.sidebar}>
      <div className={styles.sidebarTop}>
        <Image alt="CONEK Logo" height={20} loading="eager" src="/conek-logo-weiss.svg" width={100} />
        <DividerBlock height={1} />
        <div className="row space-between align-center gap-s">
          <UserAvatar fontSize={16} height={32} user={userProfile} width={32} />
          <span className="grow" style={{ color: 'white' }}>
            {userProfile?.user_name_first}
          </span>
          <NotificationButton user={userProfile} />
        </div>
      </div>
      <div className={styles.sidebarContent} style={{ flexGrow: 1 }}>
        <AdminSidebarButton icon="pi pi-home" label="Dashboard" target="/dashboard" />
        <DividerBlock height={1} />
        <label>
          <strong>Kunden</strong>
        </label>
        <AdminSidebarButton icon="pi pi-user" label="Meine Daten" target="/dashboard/daten" />
        <AdminSidebarButton icon="pi pi-file-pdf" label="Dokumente" target="/dashboard/dokumente" />
        <DividerBlock height={1} />
        <label>
          <strong>Hilfe & Support</strong>
        </label>
        <AdminSidebarButton
          icon="pi pi-question-circle"
          label="Tickets"
          target="/dashboard/tickets"
        />
      </div>
      <div className={styles.sidebarContent}>
        <AdminSidebarButton action={logout} icon="pi pi-sign-out" label="Abmelden" />
      </div>
    </div>
  );
}
