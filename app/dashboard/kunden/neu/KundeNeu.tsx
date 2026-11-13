"use client"

import { createKunde, updateKunde } from "@/app/actions/kunden";
import MandantenEditor from "@/app/components/agency/mandanten/MandantenEditor";
import Button from "@/app/components/buttons/Button";
import DividerBlock from "@/app/components/DividerBlock";
import { TextInputLabel } from "@/app/components/forms/FormElements";
import { SelectLabel } from "@/app/components/inputs/Select";
import DashboardContainer from "@/app/components/layout/DashboardContainer";
import Grid from "@/app/components/layout/Grid";
import Row from "@/app/components/layout/Row";
import { LAENDER_SORTIERT } from "@/app/constants/countries";
import { useAuth } from "@/app/context/AuthContext";
import { Toast } from "primereact/toast";
import { useRef, useState } from "react";

export default function KundeNeu() {
    const { team, user, userProfile } = useAuth();

    // IMPORTS
    const toast = useRef<Toast | null>(null);

    // ACTIONS
    const saved = () => {
        toast.current?.show({
            severity: 'success',
            summary: 'Mandant gespeichert',
            detail: 'Der Mandant wurde erfolgreich angelegt.',
        });
    }

    return (
        <>
            <Toast ref={toast} />
            <MandantenEditor header="Neuen Kunden anlegen" onSave={saved} />
        </>

    )
}