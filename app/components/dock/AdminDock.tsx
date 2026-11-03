"use client"

import { ChartArea, Home, List, Receipt, Repeat, Repeat1, Users } from 'lucide-react';
import { Dock } from 'primereact/dock';
import { useRouter } from 'next/navigation';
import type { MenuItem } from 'primereact/menuitem';

export default function AdminDock() {
    const router = useRouter();

    const adminItems: MenuItem[] = [
        {
            label: 'Dashboard',
            icon: () => <Home />,
            command: () => router.push('/admin'),
        },
        {
            label: 'Kunden',
            icon: () => <Users />,
            command: () => router.push('/admin/kunden'),
        },
        {
            label: 'Rechnungen',
            icon: () => <Receipt />,
            command: () => router.push('/admin/rechnungen'),
        },
                {
            label: 'Abonnements',
            icon: () => <Repeat />,
            command: () => router.push('/admin/abonnements'),
        },
        {
            label: 'Aufgaben',
            icon: () => <List />,
            command: () => router.push('/admin/aufgaben'),
        },
        {
            label: 'Daten',
            icon: () => <ChartArea />,
            command: () => router.push('/admin/statistiken'),
        },
    ];

    return <Dock model={adminItems} position="bottom" />
}