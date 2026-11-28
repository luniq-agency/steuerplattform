'use client';

import RechnungEditor from "@/app/components/shared/rechnungen/RechnungEditor";
import { Rechnung } from "@/app/types/rechnung/Rechnungen";

interface Props {
  invoice: Rechnung;
}

export default function RechnungPage({ invoice }: Props) {
  return (
    <RechnungEditor rechnung={invoice} />
  );
}
