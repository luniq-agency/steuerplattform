import { Task, TaskUpdate, User } from '@/app/types/Database';
import Column from '../layout/Column';
import Row from '../layout/Row';
import DetailField from '../forms/DetailField';
import UserDisplay from '../users/UserDisplay';
import { useEffect, useState } from 'react';
import { taskClose, taskUpdate, taskUpdateCreate, taskUpdatesLoad } from '@/app/actions/tasks';
import { formatDate } from '@/app/utils/formats';
import { PrimaryButton } from '../buttons/Buttons';
import { DatePicker } from '../forms/datepicker/DatePicker';
import UserSelector from '../forms/UserSelector';
import { Dropdown } from 'primereact/dropdown';
import DividerBlock from '../DividerBlock';
import { InputTextarea } from 'primereact/inputtextarea';
import { filterAdmins } from '@/app/actions/users/filter';
import { updateOptions } from '@/app/constants/updates';
import { useAuth } from '@/app/context/AuthContext';

interface Props {
  onFinished: () => void;
  task: Task;
  users: User[];
}

export default function TaskDetailSidebar({ onFinished, task, users }: Props) {
  const admins = filterAdmins(users);
  const assignee = users.find((u) => u.id === task.assignee);
  const creator = users.find((u) => u.id === task.created_by);
  const { userProfile } = useAuth();

  // STATES
  const [submitting, setSubmitting] = useState(false);

  // DATA
  const [updates, setUpdates] = useState<TaskUpdate[]>([]);

  // INPUTS
  const [date, setDate] = useState<Date | null>(null);

  const [updateTarget, setUpdateTarget] = useState<User | null>(null);
  const [updateText, setUpdateText] = useState('');
  const [updateType, setUpdateType] = useState('');

  if (!task || !users) return;

  useEffect(() => {
    if (!task) return;
    console.log('User', users);
    const fetchData = async () => {
      const res = await taskUpdatesLoad(task.id);
      setUpdates(res);
    };
    fetchData();
  }, [task]);

  // ACTIONS
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
      onFinished();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdateTarget(null);
      setUpdateText('');
      setUpdateType('');
      setSubmitting(false);
    }
  };

  return (
    <Column gap={40}>
      <Column>
        <h2>{task.title}</h2>
        <DetailField
          label="Fälligkeitsdatum"
          value={task.due_date ? formatDate(task.due_date) : '–'}
        />
        {creator && <UserDisplay label="Erstellt von" user={creator} />}
        {assignee && <UserDisplay label="Bearbeiter" user={assignee} />}
      </Column>
      <Column>
        <h3>Update verfassen</h3>
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
              <DatePicker label="Erinnerung am" onChange={setDate} value={date} />
            )}
            <PrimaryButton label="Speichern" onClick={createUpdate} />
          </div>
        ) : (
          <span>Diese Aufgabe wurde geschlossen.</span>
        )}
      </Column>
      <Column>
        <h3>Historie</h3>
        {updates.map((u, i) => (
          <DetailField key={i} label={formatDate(u.created_at)} value={`${u.creator}: ${u.body}`} />
        ))}
      </Column>
    </Column>
  );
}
