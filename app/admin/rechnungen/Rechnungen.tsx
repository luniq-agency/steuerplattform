'use client';

import { redirect } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { User } from '@/app/types/Database';
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
      </div>
      <DividerBlock height={2} />
      <div className="container">
      </div>
    </div>
  );
}
