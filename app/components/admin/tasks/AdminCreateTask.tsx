'use client';

import { useAuth } from '@/app/context/AuthContext';
import { User } from '@/app/types/Database';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { useEffect, useState } from 'react';
import { DatePicker, SelectLabel, TextAreaLabel, TextInputLabel } from '../../forms/FormElements';
import { adminLookUp } from '@/app/actions/admin';
import { taskCreate, taskUpdateCreate } from '@/app/actions/tasks';
import { notificationCreate } from '@/app/actions/notification';
import { usersLoadAll } from '@/app/actions/users';
import { priority_options } from '@/app/constants/Constants';
import { clientsLoad } from '@/app/actions/clients/clients';
import { filterAdmins, filterClients, filterClientsAll } from '@/app/actions/users/filter';
import UserSelector from '../../forms/UserSelector';

interface Props {
  onCreate: () => void;
}
export default function AdminCreateTask({ onCreate }: Props) {
  const { userProfile } = useAuth();

  const [submitting, setSubmitting] = useState(false);
  const [visible, setVisible] = useState(false);

  const isAdmin = userProfile?.user_role === 'admin';

  // USERS
  const [selectedAdmin, setSelectedAdmin] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    if (!userProfile) return;
    const fetchData = async () => {
      try {
        const res = await usersLoadAll();
        setUsers(res);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [userProfile]);

  //INPUTS
  const [taskAssignee, setTaskAssignee] = useState<User | null>(null);
  const [taskDescription, setTaskDescription] = useState('');
  const [taskDueDate, setTaskDueDate] = useState<Date | null>(null);
  const [taskName, setTaskName] = useState('');
  const [taskPriority, setTaskPriority] = useState('');
  const [taskUser, setTaskUser] = useState<User | null>(null);

  //ACTIONS
  const createTask = async () => {
    setSubmitting(true);

    if (!selectedAdmin || !userProfile) return;

    const notificationPayload = {
      message: `${userProfile?.user_name_first} ${userProfile?.user_name_last} hat die Aufgabe '${taskName}' erstellt und dir zugewiesen.`,
      read: false,
      recipient: selectedAdmin.id,
      title: 'Neue Aufgabe',
    };

    const taskPayload = {
      assignee: isAdmin ? selectedAdmin.id : userProfile?.id,
      created_at: new Date(),
      created_by: userProfile?.id,
      description: taskDescription,
      due_date: taskDueDate || null,
      priority: taskPriority || 'low',
      status: 'open',
      title: taskName,
      user: taskUser?.id || null,
    };

    try {
      const taskRes = await taskCreate(taskPayload, userProfile);

      const taskUpdatePayload = {
        body: `${userProfile?.user_name_first} ${userProfile?.user_name_last} hat den Task erstellt.`,
        created_by: userProfile?.id,
        creator: `${userProfile?.user_name_first} ${userProfile?.user_name_last}`,
        image: userProfile?.avatar || null,
        task: taskRes.id,
      };

      await taskUpdateCreate(taskUpdatePayload);
      if (selectedAdmin.id !== userProfile?.id)
        await notificationCreate(notificationPayload, selectedAdmin);
      onCreate();
    } catch (err) {
      console.error(err);
    }
    setSubmitting(false);
    setVisible(false);
    setTaskAssignee(null);
    setTaskDescription('');
    setTaskDueDate(null);
    setTaskName('');
    setTaskPriority('');
    setTaskUser(null);
  };

  // OPTIONS
  const adminOptions = filterAdmins(users);
  const clientOptions =
    userProfile?.user_role === 'admin'
      ? filterClientsAll(users)
      : filterClients(users, userProfile?.id || '1');

  return (
    <>
      <Dialog
        closable={true}
        draggable={false}
        header="Neue Aufgabe"
        onHide={() => setVisible(false)}
        style={{ maxWidth: 480, width: '100%' }}
        visible={visible}
      >
        <div className="column gap-m">
          <TextInputLabel label="Name der Aufgabe" onChange={setTaskName} value={taskName} />
          {isAdmin && (
            <UserSelector
              label="Bearbeiter"
              onChange={(value) => setSelectedAdmin(value)}
              optionLabel="fullName"
              options={adminOptions}
              value={selectedAdmin}
            />
          )}
          <div className="column gap-xs">
            <label>Verknüpfter Kunde (optional)</label>
            <Dropdown
              filter
              filterPlaceholder="Suchen"
              onChange={(e) => setTaskUser(e.value)}
              optionLabel="fullName"
              optionValue="id"
              options={clientOptions}
              value={taskUser}
            />
          </div>
          <div className="column gap-xs">
            <label>Priorität</label>
            <Dropdown
              onChange={(e) => setTaskPriority(e.value)}
              optionLabel="label"
              optionValue="value"
              options={priority_options}
              value={taskPriority}
            />
          </div>
          <DatePicker
            dateValue={taskDueDate || new Date()}
            label="Fälligkeitsdatum"
            onDateChange={setTaskDueDate}
          />
          <TextAreaLabel
            label="Beschreibung"
            onChange={setTaskDescription}
            value={taskDescription}
          />
          <Button
            className="button-primary"
            disabled={!selectedAdmin || !taskName || !taskPriority || submitting}
            icon={submitting ? 'pi pi-spinner' : undefined}
            label="Aufgabe erstellen"
            onClick={createTask}
            style={{ width: 'fit-content' }}
          />
        </div>
      </Dialog>
      <Button
        className="button-primary"
        icon="pi pi-plus"
        label="Aufgabe erstellen"
        onClick={() => setVisible(true)}
      />
    </>
  );
}
