"use client"

import { createKunde, updateKunde } from "@/app/actions/kunden";
import { userCreate, userUpdate } from "@/app/actions/users";
import MandantenEditor from "@/app/components/agency/mandanten/MandantenEditor";
import Button from "@/app/components/buttons/Button";
import DividerBlock from "@/app/components/DividerBlock";
import { DatePicker } from "@/app/components/forms/datepicker/DatePicker";
import { NumberInputLabel, TextAreaLabel, TextInputLabel } from "@/app/components/forms/FormElements";
import { SelectLabel } from "@/app/components/inputs/Select";
import DashboardContainer from "@/app/components/layout/DashboardContainer";
import Grid from "@/app/components/layout/Grid";
import Row from "@/app/components/layout/Row";
import { family_options, job_categories } from "@/app/constants/Constants";
import { LAENDER_SORTIERT } from "@/app/constants/countries";
import { useAuth } from "@/app/context/AuthContext";
import { toDateString } from "@/app/utils/formats";
import { Toast } from "primereact/toast";
import { useRef, useState } from "react";

export default function MandantNeu() {
    const { team, user, userProfile } = useAuth();

    // IMPORTS
    const toast = useRef<Toast | null>(null);

    // ACTIONS
    const save = async () => {
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