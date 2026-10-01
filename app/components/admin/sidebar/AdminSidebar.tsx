'use client';

import styles from './Sidebar.module.css';
import AdminSidebarButton, { AdminNavbarButton } from '../AdminSidebarButton';
import DividerBlock from '../../DividerBlock';
import Image from 'next/image';
import { useAuth } from '@/app/context/AuthContext';
import NotificationButton from '../../notifications/NotificationButton';
import { UserAvatar } from '../../UserAvatar';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import Row from '../../layout/Row';

export default function AdminSidebar() {
  const { user, userProfile, logout } = useAuth();

  const [expanded, setExpanded] = useState(true);
  const router = useRouter();

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1028);
    check();
    if (window.innerWidth < 1028) setExpanded(false);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  if (!userProfile) return <div className={styles.sidebar} style={{ visibility: 'hidden' }} />;

  return (
    <>
      <div className={expanded ? styles.sidebar : styles.sidebarCollapsed}>
        <div className={expanded ? styles.sidebarTop : styles.sidebarTopCollapsed}>
          <Row alignItems='center' justifyContent='space-between'>
            {expanded && (
              <Image
                alt="CONEK Logo"
                className="logo-sidebar"
                height={20}
                loading="eager"
                src="/conek-logo-weiss.svg"
                width={80}
              />
            )}
            <Button
              className="button-square"
              icon={expanded ? 'pi pi-chevron-left' : 'pi pi-chevron-right'}
              onClick={() => setExpanded(!expanded)}
              style={{ border: '1px solid white', color: 'white', padding: 8 }}
              text
            />
          </Row>
          <DividerBlock height={2} />
          <div className={expanded ? styles.sidebarProfileWrapper : styles.sidebarProfileWrapperCollapsed}>
            <div className="row gap-s width-100">
              <div
                onClick={() => {
                  router.push('/admin/profil');
                }}
                style={{ cursor: 'pointer', flexShrink: 0, width: 32 }}
              >
                <UserAvatar fontSize={16} height={32} width={32} />
              </div>
              {expanded && (
                <div className="row width-100">
                  <div className="column" style={{flexGrow: 1 }}>
                    <span style={{ color: 'white', lineHeight: '1.1em' }}>
                      {userProfile?.user_name_first}
                    </span>
                    <span style={{ color: 'var(--text-tertiary)', fontSize: 10 }}>
                      {userProfile.email}
                    </span>
                  </div>
                  <NotificationButton user={userProfile} />
                </div>
              )}
            </div>
          </div>
        </div>
        <div className={styles.sidebarContent} style={{ flexGrow: 1 }}>
          <AdminSidebarButton
            collapsed={!expanded}
            icon="pi pi-home"
            label="Dashboard"
            target="/admin"
          />
          <DividerBlock height={1} />
          <label>
            <strong>Kunden</strong>
          </label>
          <AdminSidebarButton
            collapsed={!expanded}
            icon="pi pi-users"
            label="Kunden"
            target="/admin/kunden"
          />
          {userProfile.user_role === 'admin' && (
            <AdminSidebarButton
              collapsed={!expanded}
              icon="pi pi-file-pdf"
              label="Rechnungen"
              target="/admin/rechnungen"
            />
          )}
          <AdminSidebarButton
            collapsed={!expanded}
            icon="pi pi-list"
            label="Aufgaben"
            target="/admin/aufgaben"
          />
          <AdminSidebarButton
            collapsed={!expanded}
            icon="pi pi-calendar-clock"
            label="Tickets"
            target="/admin/tickets"
          />
          <DividerBlock height={1} />
          {userProfile.user_role === 'admin' && (
            <div className="column gap-s">
              {expanded && (
                <label>
                  <strong>Verwaltung</strong>
                </label>
              )}
              <AdminSidebarButton
                collapsed={!expanded}
                icon="pi pi-crown"
                label="Mitarbeiter"
                target="/admin/admins"
              />
              <AdminSidebarButton
                collapsed={!expanded}
                icon="pi pi-sitemap"
                label="Agenturen"
                target="/admin/agenturen"
              />
              <AdminSidebarButton
                collapsed={!expanded}
                icon="pi pi-chart-bar"
                label="Statistiken"
                target="/admin/statistiken"
              />
              {/* <AdminSidebarButton
                collapsed={!expanded}
                icon="pi pi-envelope"
                label="E-Mails"
                target="/admin/emails"
              />*/}
              {expanded && (
                <Accordion>
                  <AccordionTab
                    contentClassName="accordion-content"
                    headerClassName="accordion-header"
                    headerTemplate={
                      <AdminSidebarButton
                        collapsed={!expanded}
                        icon="pi pi-cog"
                        label="Einstellungen"
                      />
                    }
                  >
                    {/*<AdminSidebarButton
                      collapsed={!expanded}
                      icon="pi pi-envelope"
                      label="E-Mail Vorlagen"
                      target="/admin/einstellungen/emails"
                    />*/}
                    <AdminSidebarButton
                      collapsed={!expanded}
                      icon="pi pi-file"
                      label="Dokumente"
                      target="/admin/einstellungen/dokumente"
                    />
                  </AccordionTab>
                </Accordion>
              )}
            </div>
          )}
        </div>
        <div className={styles.sidebarContent}>
          <AdminSidebarButton
            action={logout}
            collapsed={!expanded}
            icon="pi pi-sign-out"
            label="Abmelden"
          />
        </div>
      </div>
      <div className={styles.navbar}>
        <AdminNavbarButton icon="pi pi-home" label="Dashboard" target="/admin" />
        <AdminNavbarButton icon="pi pi-users" label="Kunden" target="/admin/kunden" />
        <AdminNavbarButton icon="pi pi-list" label="Aufgaben" target="/admin/aufgaben" />
      </div>
    </>
  );
}
