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
            icon: () => <Home />,
            command: () => router.push('/admin'),
            target: '/admin'
        },
        {
            label: 'Kunden',
            icon: () => <Users />,
            command: () => router.push('/admin/kunden'),
            target: '/admin/kunden'
        },
        {
            label: 'Rechnungen',
            icon: () => <Receipt />,
            command: () => router.push('/admin/rechnungen'),
            target: '/admin/rechnungen'
        },
        {
            label: 'Abonnements',
            icon: () => <Repeat />,
            command: () => router.push('/admin/abonnements'),
            target: '/admin/abonnements',
        },
        {
            label: 'Aufgaben',
            icon: () => <List />,
            command: () => router.push('/admin/vorgaenge'),
            target: '/admin/vorgaenge',
        },
        {
            label: 'Daten',
            icon: () => <ChartArea />,
            command: () => router.push('/admin/statistiken'),
            target: '/admin/statistiken',
        },
    ];

    return (
        <>
            <div className="mobile-menu-admin">
                {adminItems.map((a) => <AdminNavbarButton icon={a.icon} label={a.label || ''} target={a.target}/>)}
            </div>
            <Dock className="mobile-hidden" model={adminItems} position="bottom" />
        </>
    )
}