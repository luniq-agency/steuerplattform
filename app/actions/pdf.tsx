'use server';

import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { InvoicePDF } from '@/app/components/pdf/InvoicePDF';
import { Invoice, InvoiceItem, User } from '../types/Database';

export async function generateInvoicePDF(
  invoice: Invoice,
  items: InvoiceItem[],
  recipient: User
): Promise<Buffer> {

  const buffer = await renderToBuffer(
    React.createElement(InvoicePDF, { invoice, items, recipient }) as any
  );
  return Buffer.from(buffer);
}
