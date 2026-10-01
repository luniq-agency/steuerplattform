// components/pdf/InvoicePDFPreview.tsx
'use client';

import { PDFViewer } from '@react-pdf/renderer';
import { InvoiceShowcase } from './InvoiceShowcase';
import type { Invoice, InvoiceItem, User } from '@/app/types/Database';

interface Props {
  gross: number;
  invoice: Invoice;
  items: InvoiceItem[];
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
