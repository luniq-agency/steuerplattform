'use client';

import { User } from '@/app/types/Database';
import { useEffect, useState } from 'react';
import { SelectLabel, TextInputLabel } from '../forms/FormElements';
import { adminsLoadAll } from '@/app/actions/admin';
import { UserSelect } from '../forms/Select';

export default function TaskCreator() {
  // DATA
  const [admins, setAdmins] = useState<User[]>([]);

  // INIT
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await adminsLoadAll();
        setAdmins(res);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const adminOptions = admins
    .map((a) => ({
      ...a,
      fullName: `${a.user_name_last}, ${a.user_name_first}`,
    }))
    .sort((a: User, b: User) => a.user_name_last.localeCompare(b.user_name_last));

  // INPUTS
  const [taskAssignee, setTaskAssignee] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskDueDate, setTaskDueDate] = useState<Date | null>(null);
  const [taskName, setTaskName] = useState('');
  const [taskUser, setTaskUser] = useState<User | null>(null);

  return (
    <div className="column gap-m">
      <TextInputLabel label="Name der Aufgabe" onChange={setTaskName} value={taskName} />
      <UserSelect
        label="Bearbeiter"
        onChange={setTaskAssignee}
        optionLabel="fullName"
        optionValue="id"
        options={adminOptions}
        value={taskAssignee}
      />
    </div>
  );
}
