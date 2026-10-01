'use client';

import { adminsLoadAll } from '@/app/actions/admin';
import { tasksLoadAll, tasksLoadOpen, tasksOpenAdmin, tasksOpenAgency } from '@/app/actions/tasks';
import { usersLoadAll } from '@/app/actions/users';
import AdminPageHeader from '@/app/components/admin/AdminPageHeader';
import AdminCreateTask from '@/app/components/admin/tasks/AdminCreateTask';
import TaskKanban from '@/app/components/aufgaben/TaskKanban';
import { useAuth } from '@/app/context/AuthContext';
import { Task, User } from '@/app/types/Database';
import { Metadata } from 'next';
import { useEffect, useState } from 'react';

export const metadata: Metadata = {
  title: 'Aufgaben | CONEK',
  description: '',
};

export default function AufgabenPage() {
  const { userProfile } = useAuth();

  const [admins, setAdmins] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (!userProfile) return;
    const fetchData = async () => {
      const adminRes = await adminsLoadAll();
      const userRes = await usersLoadAll();
      const res =
        userProfile?.user_role === 'admin'
          ? await tasksOpenAdmin()
          : await tasksOpenAgency(userProfile.id);
      setAdmins(adminRes);
      setTasks(res);
      setUsers(userRes);
    };
    fetchData();
  }, [userProfile]);

  const update = async () => {
    if (!userProfile) return;
    const res =
      userProfile?.user_role === 'admin'
        ? await tasksOpenAdmin()
        : await tasksOpenAgency(userProfile.id);
    setTasks(res);
  };

  return (
    <div className="page-content" style={{ padding: 0 }}>
      <AdminPageHeader>
        <div className="row space-between">
          <h1>Aufgaben</h1>
          <AdminCreateTask onCreate={update} />
        </div>
      </AdminPageHeader>
      <div className="content-alt" style={{ flexGrow: 1, padding: '1.5rem' }}>
        <TaskKanban admins={admins} tasks={tasks} users={users}/>
      </div>
    </div>
  );
}
