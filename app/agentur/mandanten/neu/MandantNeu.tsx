"use client"

import MandantenEditor from "@/app/components/agency/mandanten/MandantenEditor";
import { Toast } from "primereact/toast";
import { useRouter } from "next/navigation";
import { useRef } from "react";

export default function MandantNeu() {
    const router = useRouter();

    // IMPORTS
    const toast = useRef<Toast | null>(null);

    // ACTIONS
    const save = async () => {
        router.push('/agentur/mandanten');
        toast.current?.show({
            severity: 'success',
            summary: 'Mandant gespeichert',
            detail: 'Der Mandant wurde erfolgreich angelegt.',
        });

    }

    return (
        <div className="content-wrapper" style={{ height: '100%', padding: 16 }}>
            <MandantenEditor header="Neuen Mandanten anlegen" onSave={save} />
        </div>
    )
}