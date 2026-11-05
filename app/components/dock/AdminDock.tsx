"use client"

import { ChartArea, Home, List, Receipt, Repeat, Repeat1, Users } from 'lucide-react';
import { Dock } from 'primereact/dock';
import { useRouter } from 'next/navigation';
import type { MenuItem } from 'primereact/menuitem';
import { Menubar } from 'primereact/menubar';
import { AdminNavbarButton } from '../sidebar/SidebarButton';

export default function AdminDock() {
    const router = useRouter();

    const adminItems: MenuItem[] = [
        {
            label: 'Dashboard',
            icon: () => <Home strokeWidth={1.5} />,
            command: () => router.push('/admin'),
            target: '/admin'
        },
        {
            label: 'Kunden',
            icon: () => <Users strokeWidth={1.5} />,
            command: () => router.push('/admin/kunden'),
            target: '/admin/kunden'
        },
        {
            label: 'Rechnungen',
            icon: () => <Receipt strokeWidth={1.5} />,
            command: () => router.push('/admin/rechnungen'),
            target: '/admin/rechnungen'
        },
        {
            label: 'Abonnements',
            icon: () => <Repeat strokeWidth={1.5} />,
            command: () => router.push('/admin/abonnements'),
            target: '/admin/abonnements',
        },
        {
            label: 'Aufgaben',
            icon: () => <List strokeWidth={1.5} />,
            command: () => router.push('/admin/vorgaenge'),
            target: '/admin/vorgaenge',
        },
        {
            label: 'Daten',
            icon: () => <ChartArea strokeWidth={1.5} />,
            command: () => router.push('/admin/statistiken'),
            target: '/admin/statistiken',
        },
    ];

    return (
        <>
            <div className="mobile-menu-admin">
                {adminItems.map((a, i) => <AdminNavbarButton icon={a.icon} key={i} label={a.label || ''} target={a.target} />)}
            </div>
            <Dock className="mobile-hidden" model={adminItems} position="bottom" />
        </>
    )
}