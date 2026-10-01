'use client';

import styles from '@/app/components/admin/Admin.module.css';
import DividerBlock from '../components/DividerBlock';
import Link from 'next/link';
import Loader from '../components/Loader';
import { useAuth } from '@/app/context/AuthContext';
import { useEffect, useRef, useState } from 'react';
import { TaskTableSmall } from '../components/aufgaben/TaskTable';
import StatCard from '../components/cards/StatCard';
import { Task, User } from '@/app/types/Database';
import { adminsLoadAll } from '@/app/actions/admin';
import { clientsLoadAll } from '@/app/actions/clients';
import { Registration, registrationsLoadMonthly } from '@/app/actions/stats';
import { tasksLoadOpenLatest } from '@/app/actions/tasks';
import { useProfilePolling } from '@/app/hooks/useProfilePolling';
import { ClientTableSmall } from '../components/clients/ClientTableSmall';
import Grid from '../components/layout/Grid';
import DashboardContainer from '../components/layout/DashboardContainer';
import { ListCheck, Users } from 'lucide-react';
import { agencyGetSignups } from '../actions/stats/agency';

export default function AdminDashboard() {
  const mounted = useRef(false);
  const { loading, user, userProfile } = useAuth();
  useProfilePolling(user, userProfile);

  // DATA
  const [admins, setAdmins] = useState<User[]>([]);
  const [clients, setClients] = useState<User[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  // INIT
  useEffect(() => {
    if (!userProfile || mounted.current) return;
    mounted.current = true;

    const fetchData = async () => {
      try {
        const [adminRes, clientRes, registerRes, taskRes] = await Promise.all([
          adminsLoadAll(),
          clientsLoadAll(userProfile.user_role, userProfile.id),
          userProfile.user_role === 'admin'
            ? registrationsLoadMonthly()
            : agencyGetSignups(userProfile.id),
          tasksLoadOpenLatest(userProfile.user_role, userProfile.id),
        ]);
        setAdmins(adminRes);
        setClients(clientRes);
        setRegistrations(registerRes);
        setTasks(taskRes);
        console.log(registerRes);
      } catch (err) {}
    };
    fetchData();
  }, [userProfile]);

  if (loading) return <Loader text="Wird geladen..." />;
  if (!user) return null;
  if (!userProfile) return <Loader text="Profil wird eingerichtet..." />;

  return (
    <div className="page-content">
      <h1 className={styles.h1}>Dashboard</h1>
      <DividerBlock height={1} />
      <Grid columns={2} gap={16}>
        <StatCard header="Offene Aufgaben" icon={ListCheck} value={tasks.length} />
        <StatCard header="Anmeldungen" icon={Users} value={registrations.length ?? 0} />
        <DashboardContainer
          header="Offene Aufgaben"
          target="/admin/aufgaben"
          targetLabel="Alle ansehen"
        >
          <TaskTableSmall admins={admins} tasks={tasks} />
        </DashboardContainer>
        <DashboardContainer
          header="Letzte Anmeldungen"
          target="/admin/kunden"
          targetLabel="Alle ansehen"
        >
          <ClientTableSmall clients={clients} />
        </DashboardContainer>
      </Grid>
    </div>
  );
}
