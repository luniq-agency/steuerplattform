'use client';

import AdminCreateInvoice from '@/app/components/admin/invoices/AdminCreateInvoice';
import { redirect } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { User } from '@/app/types/Database';
import InvoicesTable from '@/app/components/admin/invoices/InvoicesTable';
import DividerBlock from '@/app/components/DividerBlock';

interface Props {
  clients: User[];
}
export default function Rechnungen({ clients }: Props) {
  const { userProfile } = useAuth();
  if (!userProfile) return;

  if (userProfile.rolle != 'admin') redirect('/admin');

  return (
    <div className="page-content">
      <div className="row space-between">
        <h1>Rechnungen</h1>
        <AdminCreateInvoice users={clients} />
      </div>
      <DividerBlock height={2} />
      <div className="container">
        <InvoicesTable clients={clients} />
      </div>
    </div>
  );
}
