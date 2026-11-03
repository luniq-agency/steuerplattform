// components/pdf/InvoicePDFPreview.tsx
'use client';

import { PDFViewer } from '@react-pdf/renderer';
import { InvoiceShowcase } from './InvoiceShowcase';
import type { Invoice, InvoiceItem, User } from '@/app/types/Database';
import { Rechnungsposten } from '@/app/types/rechnung/Rechnungen';

interface Props {
  gross: number;
  invoice: Invoice;
  items: Rechnungsposten[];
  recipient: User;
  net: number;
  tax: number;
  total: number;
  taxMultiplier: number;
}

export default function InvoicePDFPreview(props: Props) {
  return (
    <PDFViewer width="100%" height="600">
      <InvoiceShowcase {...props} />
    </PDFViewer>
  );
}
