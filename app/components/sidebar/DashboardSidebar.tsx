'use client';

import styles from "./Sidebar.module.css";
import AdminSidebarButton, { AdminNavbarButton } from './SidebarButton';
import DividerBlock from '../DividerBlock';
import Image from 'next/image';
import { useAuth } from '@/app/context/AuthContext';
import NotificationButton from '../notifications/NotificationButton';
import { UserAvatar } from '../UserAvatar';
import { Briefcase, BriefcaseBusiness, CardSim, ChartArea, CheckCheck, File, FileQuestion, Folder, Grid, Grid2X2, Handshake, LogOut, Receipt, Repeat, SquareKanban, Users } from 'lucide-react';
import Column from '../layout/Column';
import Row from '../layout/Row';
import SidebarLabel from './SidebarLabel';

export default function ClientSidebar() {
  const { logout, team, userProfile } = useAuth();
  const isDev = process.env.NODE_ENV === 'development';
  if (!userProfile) return;

  return (
    <>
      <div className={styles.sidebar}>
        <div className={styles.sidebarTop}>
          <img alt="ADVACT Logo" height={20} loading="eager" src="/advact-logo-black.png" width={100} />
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
          <SidebarLabel label="Dokumente" />
          <AdminSidebarButton icon={Folder} label="Alle Dokumente" target="/dashboard/dokumente" />
          <DividerBlock height={1} />
          <SidebarLabel hidden={!isDev} label="Finanzen" />
          <AdminSidebarButton exact icon={ChartArea} label="Überblick" target="/dashboard/finanzen" />
          <AdminSidebarButton icon={File} label="Rechnungen" target="/dashboard/finanzen/rechnungen" />
          <AdminSidebarButton hidden={!isDev} icon={Receipt} label="Belege/Ausgaben" target="/dashboard/finanzen/belege" />
          <DividerBlock height={1} />
          <SidebarLabel hidden={!isDev} label="Projektmanagement" />
          <AdminSidebarButton hidden={!isDev} icon={SquareKanban} label="Projekte" target="/dashboard/projekte" />
          <DividerBlock height={1} />
          <SidebarLabel label="Unternehmen" />
          <AdminSidebarButton hidden={!team?.einzelkonto} icon={BriefcaseBusiness} label="Mein Unternehmen" target="/dashboard/team" />
          <AdminSidebarButton hidden={!team?.einzelkonto} icon={Users} label="Mitarbeiter" target="/dashboard/team/mitarbeiter" />
          <AdminSidebarButton icon={Handshake} label="Kunden" target="/dashboard/kunden" />
          <DividerBlock height={1} />
          <SidebarLabel hidden={!isDev} label="Hilfe & Support" />
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
      <div className={styles.navbar}>
        <AdminNavbarButton icon={Grid2X2} label="Dashboard" target="/dashboard" />
        <AdminNavbarButton icon={Folder} label="Dokumente" target="/dashboard/dokumente" />
        <AdminNavbarButton icon={CheckCheck} label="Vorgänge" target="/dashboard/vorgaenge" />
      </div>
    </>

  );
}
