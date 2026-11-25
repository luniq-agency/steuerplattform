"use client"

import KundenEditor from "@/app/components/clients/kunden/KundenEditor";
import { useAuth } from "@/app/context/AuthContext";
import { Toast } from "primereact/toast";
import { useRef } from "react";

export default function KundeNeu() {
    // IMPORTS
    const toast = useRef<Toast | null>(null);

    // ACTIONS
    const saved = () => {
        toast.current?.show({
            severity: 'success',
            summary: 'Kunde gespeichert',
            detail: 'Der Kunde wurde erfolgreich angelegt.',
        });
    }

    return (
        <>
            <Toast ref={toast} />
            <KundenEditor header="Neuen Kunden anlegen" onSave={saved} />
        </>

    )
}