'use client';

import { taskClose, taskUpdate, taskUpdateCreate, taskUpdatesLoad } from '@/app/actions/tasks';
import { Task, TaskUpdate, User } from '@/app/types/Database';
import { Timeline } from 'primereact/timeline';
import { useEffect, useState } from 'react';
import { UserAvatar, UserAvatarOther } from '../../UserAvatar';
import { userLookup, usersLoadAll } from '@/app/actions/users';
import { useAuth } from '@/app/context/AuthContext';
import { Button } from 'primereact/button';
import DividerBlock from '../../DividerBlock';
import { formatDate, formatDateWithTime } from '@/app/utils/formats';
import { Dropdown } from 'primereact/dropdown';
import { InputTextarea } from 'primereact/inputtextarea';
import { DatePicker } from '../../forms/FormElements';
import { PrimaryButton } from '../../buttons/Buttons';
import { LoaderCircle } from 'lucide-react';
import DashboardContainer from '../../layout/DashboardContainer';
import Column from '../../layout/Column';
import UserDisplay from '../../users/UserDisplay';
import Row from '../../layout/Row';
import UserSelector from '../../forms/UserSelector';
import { filterAdmins } from '@/app/actions/users/filter';
import { useRouter } from 'next/navigation';
import DetailField from '../../forms/DetailField';

const updateOptions = [
  {
    label: 'Aufgabe abgeschlossen',
    value: 'close',
  },
  { label: 'Aufgabe übertragen', value: 'transfer' },
  {
    label: 'Auf Wiedervorlage',
    value: 'hold',
  },
  {
    label: 'Update schreiben',
    value: 'update',
  },
];

interface Props {
  task: Task;
}

export default function TaskEditor({ task }: Props) {
  const router = useRouter();
  const { userProfile } = useAuth();
  const [updates, setUpdates] = useState<TaskUpdate[]>([]);
  const [userMap, setUserMap] = useState<Record<string, User>>({});

  const [submitting, setSubmitting] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  //INPUTS
  const [updateTarget, setUpdateTarget] = useState<User | null>(null);
  const [updateText, setUpdateText] = useState('');
  const [updateType, setUpdateType] = useState('');

  const [date, setDate] = useState<Date | undefined>(undefined);

  const customMarker = (item: TaskUpdate) => {
    const user = userMap[item.created_by];
    return <UserAvatar fontSize={16} height={32} user={user} width={32} />;
  };

  const customContent = (item: TaskUpdate) => {
    const creator = users.find((u) => u.id === item.created_by);

    return (
      <div className="column">
        <Row alignItems="center" gap={8}>
          <UserAvatar fontSize={14} height={30} user={creator} width={30} />
          <Column gap={0}>
            <Row justifyContent="space-between">
              <span style={{ fontSize: 14, fontWeight: 700 }}>{item.creator}</span>
              <span className="text-s" style={{ whiteSpace: 'nowrap' }}>
                {formatDateWithTime(item.created_at)}
              </span>
            </Row>
            <span className="text-s">{item.body}</span>
          </Column>
        </Row>
      </div>
    );
  };

  // ACTIONS
  const reload = async () => {
    try {
      router.refresh();
      const res = await taskUpdatesLoad(task.id);
      setUpdates(res);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUpdates = async () => {
    try {
      const res = await taskUpdatesLoad(task.id);
      const adminRes = await usersLoadAll();
      setUpdates(res);
      setUsers(adminRes);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!task) return;
    fetchUpdates();
  }, [task]);

  useEffect(() => {
    if (!updates.length) return;

    const fetchUsers = async () => {
      const entries = await Promise.all(
        updates.map(async (u) => {
          const user = await userLookup(u.created_by);
          return [u.created_by, user] as [string, User];
        })
      );
      setUserMap(Object.fromEntries(entries));
    };

    fetchUsers();
  }, [updates]);

  const createUpdate = async () => {
    if (!updateType) return;

    console.log('Ziel:', updateTarget);
    let body = updateText;
    if (updateType === 'close') body = 'Aufgabe wurde geschlossen.';
    if (updateType === 'hold' && date)
      body = `Aufgabe auf Wiedervorlage mit Datum ${formatDate(date)} gesetzt.`;
    if (updateType === 'transfer' && updateTarget)
      body = `Die Aufgabe wurde an ${updateTarget?.user_name_first} ${updateTarget?.user_name_last} übertragen.`;
    setSubmitting(true);

    const payload = {
      body: body || updateText,
      created_at: new Date(),
      created_by: userProfile?.id,
      creator: `${userProfile?.user_name_first} ${userProfile?.user_name_last}`,
      task: task.id,
    };

    const taskPayload = {
      assignee: updateTarget?.id || '',
      due_date: date || null,
      status: updateType === 'transfer' ? task.status : 'on_hold',
    };

    try {
      await taskUpdateCreate(payload);
      if (updateType === 'close') await taskClose(task.id);
      if (updateType === 'hold' || updateType === 'transfer')
        await taskUpdate(taskPayload, task.id);
      reload();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdateTarget(null);
      setUpdateText('');
      setUpdateType('');
      setSubmitting(false);
    }
  };

  // STATES
  const dateEmpty = updateType == 'hold' && !date;
  const textEmpty = updateType == 'update' && !updateText;
  const targetEmpty = updateType == 'transfer' && !updateTarget;

  // USER

  const assignee = users.find((t) => t.id === task.assignee);
  const client = users.find((t) => t.id === task.user);
  const creator = users.find((t) => t.id === task.created_by);

  const userOptions = users
    .filter((u) => u.user_role === 'admin')
    .map((u) => ({
      ...u,
      fullName: `${u.user_name_last}, ${u.user_name_first}`,
    }))
    .sort((a, b) => a.user_name_last.localeCompare(b.user_name_last));

  if (!users || !userOptions) return;

  const admins = filterAdmins(users);

  return (
    <div className="row gap-m width-100">
      <DashboardContainer header={task.title}>
        <DetailField label="Beschreibung" value={task.description || '–'} />
        <DividerBlock height={1} />
        <DetailField label="Erstellt am" value={formatDate(task.created_at)} />
        <DividerBlock height={1} />
        <DetailField label="Fällig bis" value={task.due_date ? formatDate(task.due_date) : '–'} />
        <DividerBlock height={1} />
        <UserDisplay label="Erstellt von" user={creator || null} />
        <DividerBlock height={1} />
        <UserDisplay label="Bearbeiter" user={assignee || null} />
        <DividerBlock height={1} />
        <UserDisplay label="Verknüpfter Kunde" user={client || null} />
        <DividerBlock height={1} />
        {task.status != 'closed' ? (
          <div className="column gap-s">
            <label>Update</label>
            <Dropdown
              onChange={(e) => setUpdateType(e.value)}
              optionLabel="label"
              optionValue="value"
              options={updateOptions}
              value={updateType}
            />
            <DividerBlock height={0.25} />
            {updateType === 'update' && (
              <InputTextarea
                onChange={(e) => setUpdateText(e.target.value)}
                rows={5}
                value={updateText}
              />
            )}
            {updateType === 'transfer' && (
              <UserSelector
                label="Neuer Bearbeiter"
                onChange={setUpdateTarget}
                optionLabel="fullName"
                options={admins}
                value={updateTarget}
              />
            )}
            {updateType === 'hold' && (
              <DatePicker
                label="Erinnerung am"
                minDate={new Date()}
                onDateChange={setDate}
                dateValue={date}
              />
            )}
            <PrimaryButton
              disabled={
                !updateType ||
                submitting ||
                task.status === 'closed' ||
                textEmpty ||
                targetEmpty ||
                dateEmpty
              }
              label="Speichern"
              onClick={createUpdate}
            />
          </div>
        ) : (
          <div className="column gap-s">
            <label>Update</label>
            <span>Die Aufgabe wurde abgeschlossen.</span>
          </div>
        )}
      </DashboardContainer>
      <DashboardContainer header="Verlauf">
        <Timeline align="left" content={customContent} marker={customMarker} value={updates} />
      </DashboardContainer>
    </div>
  );
}
