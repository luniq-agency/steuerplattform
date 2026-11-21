'use client';

import { fetchInvoicePositions } from "@/app/actions/documents/rechnungen";
import { createKunde, fetchKundeById, updateKunde } from "@/app/actions/kunden";
import { saveInvoice } from "@/app/actions/rechnung";
import Button from "@/app/components/buttons/Button";
import { IconButton } from "@/app/components/buttons/IconButton";
import RechnungspostenTabelle from "@/app/components/clients/rechnungen/RechnungspostenTabelle";
import DividerBlock from "@/app/components/DividerBlock";
import { DatePicker } from "@/app/components/forms/datepicker/DatePicker";
import { TextInputLabel } from "@/app/components/forms/FormElements";
import { SelectLabel } from "@/app/components/inputs/Select";
import DashboardContainer from "@/app/components/layout/DashboardContainer";
import Grid from "@/app/components/layout/Grid";
import Row from "@/app/components/layout/Row";
import RechnungEditor from "@/app/components/shared/rechnungen/RechnungEditor";
import { LAENDER_SORTIERT } from "@/app/constants/countries";
import { useAuth } from "@/app/context/AuthContext";
import { Kunde } from "@/app/types/clients";
import { Rechnung, TempPosten } from "@/app/types/rechnung/Rechnungen";
import { parseDate, toDateString } from "@/app/utils/formats";
import { Plus } from "lucide-react";
import { Toast } from "primereact/toast";
import { useEffect, useRef, useState } from "react";

interface Props {
  invoice: Rechnung;
}

export default function RechnungPage({ invoice }: Props) {
  return (
    <RechnungEditor rechnung={invoice} />
  );
}
