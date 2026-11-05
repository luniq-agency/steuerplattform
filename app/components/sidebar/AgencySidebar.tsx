'use client';

import styles from "./Sidebar.module.css";
import AdminSidebarButton, { AdminNavbarButton } from '../sidebar/SidebarButton';
import DividerBlock from '../DividerBlock';
import Image from 'next/image';
import { useAuth } from '@/app/context/AuthContext';
import NotificationButton from '../notifications/NotificationButton';
import { UserAvatar } from '../UserAvatar';
import { Briefcase, BriefcaseBusiness, Calendar, ChartArea, CheckCheck, File, FileQuestion, Files, Folder, Grid, Grid2X2, LogOut, Receipt, Repeat, Users } from 'lucide-react';
import Column from '../layout/Column';
import Row from '../layout/Row';

export default function AgencySidebar() {
  const { logout, team, userProfile } = useAuth();

  if (!userProfile) return;

  return (
    <>
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
          <AdminSidebarButton exact icon={Grid2X2} label="Dashboard" target="/agentur" />
          <DividerBlock height={1} />
          <label>
            <strong>Mandanten</strong>
          </label>
          <AdminSidebarButton icon={Users} label="Meine Mandanten" target="/agentur/mandanten" />
          <DividerBlock height={1} />
          <label>
            <strong>Dokumente</strong>
          </label>
          <AdminSidebarButton icon={Files} label="Alle Dokumente" target="/agentur/dokumente" />
          <DividerBlock height={1} />
          <label>
            <strong>Vorgänge</strong>
          </label>
          <AdminSidebarButton icon={CheckCheck} label="Alle Vorgänge" target="/agentur/vorgaenge" />
          <AdminSidebarButton icon={Calendar} label="Kalender" target="/agentur/kalender" />
        </div>
        <div className={styles.sidebarContent}>
          <AdminSidebarButton action={logout} icon={LogOut} label="Abmelden" />
        </div>
      </div>
      <div className={styles.navbar}>
        <AdminNavbarButton icon={Grid2X2} label="Dashboard" target="/agentur" />
        <AdminNavbarButton icon={CheckCheck} label="Mandanten" target="/agentur/mandanten" />
        <AdminNavbarButton icon={Users} label="Vorgänge" target="/agentur/vorgaenge" />
      </div>
    </>
  );
}
