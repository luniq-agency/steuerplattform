'use client';

import { adminsLoadAll } from '@/app/actions/admin';
import { usersLoadAll } from '@/app/actions/users';
import { fetchVorgaengeAll } from '@/app/actions/vorgang/vorgang';
import Button from '@/app/components/buttons/Button';
import DividerBlock from '@/app/components/DividerBlock';
import Row from '@/app/components/layout/Row';
import VorgangTable from '@/app/components/shared/vorgang/VorgangTable';
import { useAuth } from '@/app/context/AuthContext';
import { User } from '@/app/types/Database';
import { Vorgang } from '@/app/types/vorgang';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';


export default function Vorgänge() {
  const { userProfile } = useAuth();
  const router = useRouter();

  // DATA
  const [admins, setAdmins] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Vorgang[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // STATES
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userProfile) return;
    const fetchData = async () => {
      const [adminRes, taskRes, userRes] = await Promise.all([
        adminsLoadAll(),
        fetchVorgaengeAll(),
        usersLoadAll(),
      ]);
      setAdmins(adminRes);
      setTasks(taskRes);
      setUsers(userRes);
      setLoading(false);
    };
    fetchData();
  }, [userProfile]);

  return (
    <div className="page-content">
      <Row justifyContent="space-between">
        <h1>Vorgänge</h1>
        <Link href="/admin/vorgaenge/neu">
          <Button icon={Plus} label="Vorgang erstellen" mode="secondary" onClick={() => setCreating(true)} size="small" />
        </Link>
      </Row>
      <DividerBlock height={2} />

      {/* FILTER */}

      <DividerBlock height={1} />
      {!loading && (
        <VorgangTable tasks={tasks} users={users} />
      )}
    </div>
  );
}