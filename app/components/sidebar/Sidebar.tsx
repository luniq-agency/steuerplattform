'use client';

import styles from './Sidebar.module.css';
import AdminSidebarButton, { AdminNavbarButton } from './SidebarButton';
import DividerBlock from '../DividerBlock';
import Image from 'next/image';
import { useAuth } from '@/app/context/AuthContext';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

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
          <Image
            alt="ADVACT Logo"
            className="logo-sidebar"
            height={20}
            loading="eager"
            src="/advact-logo-black.png"
            width={80}
          />
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
          {userProfile.rolle === 'admin' && (
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
          {userProfile.rolle === 'admin' && (
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
