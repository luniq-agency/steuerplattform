'use client';

import styles from '../../admin/Admin.module.css';
import AdminSidebarButton from '../../sidebar/SidebarButton';
import DividerBlock from '../../DividerBlock';
import Image from 'next/image';
import { useAuth } from '@/app/context/AuthContext';
import NotificationButton from '../../notifications/NotificationButton';
import { UserAvatar } from '../../UserAvatar';
import { Briefcase, BriefcaseBusiness, ChartArea, CheckCheck, File, FileQuestion, Folder, Grid, Grid2X2, LogOut, Receipt, Repeat, Users } from 'lucide-react';
import Column from '../../layout/Column';
import Row from '../../layout/Row';

export default function ClientSidebar() {
  const { logout, team, userProfile } = useAuth();

  if (!userProfile) return;

  return (
    <div className={styles.sidebar}>
      <div className={styles.sidebarTop}>
        <Image alt="ADVACT Logo" height={20} loading="eager" src="/advact-logo-black.png" width={100} />
        <DividerBlock height={1} />
        <Row alignItems='center' gap={8}>
          <UserAvatar fontSize={16} height={32} user={userProfile} width={32} />
          <Column gap={0} justifyContent='center'>
            <span className="grow" style={{ color: 'var(--foreground)', fontSize: 14, lineHeight: '1em' }}>
              {userProfile?.vorname}
            </span>
            <span className="text-meta">{team?.team_name}</span>
          </Column>
          <NotificationButton user={userProfile} />
        </Row>
      </div>
      <div className={styles.sidebarContent} style={{ flexGrow: 1 }}>
        <AdminSidebarButton exact icon={Grid2X2} label="Dashboard" target="/dashboard" />
        <DividerBlock height={1} />
        <label>
          <strong>Dokumente</strong>
        </label>
        <AdminSidebarButton icon={Folder} label="Alle Dokumente" target="/dashboard/dokumente" />
        <AdminSidebarButton icon={File} label="Rechnungen" target="/dashboard/rechnungen" />
        <AdminSidebarButton icon={Receipt} label="Belege/Ausgaben" target="/dashboard/belege" />
        <DividerBlock height={1} />
        <label>
          <strong>Buchhaltung</strong>
        </label>
        <AdminSidebarButton icon={ChartArea} label="Überblick" target="/dashboard/ueberblick" />
        <DividerBlock height={1} />
        <label>
          <strong>Verwaltung</strong>
        </label>
        <AdminSidebarButton icon={Users} label="Mitarbeiter" target="/dashboard/mitarbeiter" />
        <AdminSidebarButton icon={BriefcaseBusiness} label="Kunden" target="/dashboard/kunden" />
        <DividerBlock height={1} />
        <label>
          <strong>Hilfe & Support</strong>
        </label>
        <AdminSidebarButton
          icon={CheckCheck}
          label="Meine Vorgänge"
          target="/dashboard/vorgaenge"
        />
      </div>
      <div className={styles.sidebarContent}>
        <AdminSidebarButton action={logout} icon={LogOut} label="Abmelden" />
      </div>
    </div>
  );
}
