import { taskClose, taskCreate, tasksLoadUser } from '@/app/actions/tasks';
import { Task, User } from '@/app/types/Database';
import { formatDate } from '@/app/utils/formats';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { useEffect, useRef, useState } from 'react';
import { SelectLabel, TextAreaLabel, TextInputLabel } from '../forms/FormElements';
import LayoutColumn from '../layout/Column';
import Row from '../layout/Row';
import UserSelector from '../forms/UserSelector';
import { filterAdmins, filterClients } from '@/app/actions/users/filter';
import { DatePicker } from '../forms/datepicker/DatePicker';
import { Toast } from 'primereact/toast';
import { priority_options, task_status } from '@/app/constants/Constants';
import Tag from '../ui/Tag';
import { UserAvatarOther } from '../UserAvatar';
import { Sidebar } from 'primereact/sidebar';
import TaskDetailSidebar from './TaskDetailSidebar';
import { usersLoadAll } from '@/app/actions/users';
import { useAuth } from '@/app/context/AuthContext';
import { ContextButton } from '../buttons/Buttons';
import { InterfaceButton } from '../buttons/InterfaceButton';
import { Check } from 'lucide-react';

interface Props {
  staff: User[];
  user: User;
}

export default function AufgabenTable({ staff, user }: Props) {
  const toast = useRef<Toast | null>(null);
  const { userProfile } = useAuth();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // STATES
  const [creating, setCreating] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const res = await tasksLoadUser(user.id);
      const userRes = await usersLoadAll();
      setTasks(res);
      setUsers(userRes);
    };
    fetchData();
  }, [user]);

  // INPUTS
  const [taskAssignee, setTaskAssignee] = useState<User | null>(null);
  const [taskDescription, setTaskDescription] = useState('');
  const [taskDueDate, setTaskDueDate] = useState<Date | null>(null);
  const [taskName, setTaskName] = useState('');
  const [priority, setPriority] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // FILTERS
  const admins = filterAdmins(staff);
  const agents = staff.filter((s) => s.user_role === 'agency');
  const clients = filterClients(users, user.id);

  // TEMPLATES
  const assigneeTemplate = (rowData: Task) => {
    const assignee = admins.find((a) => a.id === rowData.assignee);
    if (!rowData.assignee) return <span>–</span>;

    return (
      <Row alignItems="center" gap={4}>
        <UserAvatarOther fontSize={12} height={24} user={assignee} width={24} />
        <span>
          {assignee?.user_name_first} {assignee?.user_name_last}
        </span>
      </Row>
    );
  };

  const dueDateTemplate = (rowData: Task) => {
    if (!rowData.due_date) return <span>–</span>;
    const overdue = rowData.due_date >= new Date();

    return <span style={{ color: overdue ? 'red' : 'black' }}>{formatDate(rowData.due_date)}</span>;
  };

  const statusTemplate = (rowData: Task) => {
    const status = task_status.find((t) => t.value === rowData.status);
    if (!status) return;
    return <Tag bgColor={status?.bg} color={status?.color} text={status?.label} />;
  };

  // ACTIONS
  const createTask = async () => {
    if (!userProfile) return;

    const taskPayload = {
      assignee: taskAssignee ? taskAssignee.id : null,
      created_by: userProfile?.id,
      description: taskDescription,
      due_date: taskDueDate,
      priority,
      status: 'open',
      title: taskName,
      user: user.id,
    };

    try {
      await taskCreate(taskPayload, userProfile);
      refresh();
      toast.current?.show({
        severity: 'success',
        summary: 'Aufgabe erstellt',
        detail: 'Die Aufgabe wurde erfolgreich erstellt.',
      });
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
      setTaskAssignee(null);
      setTaskDescription('');
      setTaskDueDate(null);
      setTaskName('');
      setPriority('');
    }
  };

  const markDone = async () => {
    if (!selectedTask) return;
    await taskClose(selectedTask.id);
    setVisible(false);
    refresh();
  };

  const refresh = async () => {
    setVisible(false);
    const res = await tasksLoadUser(user.id);
    setTasks(res);
    setSelectedTask(null);
  };

  // DESIGN
  const customHeader = (
    <Row>
      <InterfaceButton
        disabled={selectedTask?.status === 'closed'}
        icon={Check}
        label="Als erledigt markieren"
        onClick={markDone}
      />
    </Row>
  );

  return (
    <LayoutColumn>
      <Toast ref={toast} />
      <Sidebar
        header={customHeader}
        onHide={() => setVisible(false)}
        position="right"
        style={{ maxWidth: 640, width: '100%' }}
        visible={visible}
      >
        {selectedTask && (
          <TaskDetailSidebar onFinished={refresh} task={selectedTask} users={users} />
        )}
      </Sidebar>
      <Dialog
        draggable={false}
        header="Task erstellen"
        onHide={() => setCreating(false)}
        style={{ maxWidth: 560, width: '100%' }}
        visible={creating}
      >
        <div className="column gap-m">
          <TextInputLabel label="Name des Tasks" onChange={setTaskName} value={taskName} />
          <TextAreaLabel
            label="Beschreibung"
            onChange={setTaskDescription}
            value={taskDescription}
          />
          <DatePicker label="Fälligkeitsdatum" onChange={setTaskDueDate} value={taskDueDate} />
          <SelectLabel
            label="Priorität"
            onChange={setPriority}
            options={priority_options}
            value={priority}
          />
          <UserSelector
            label="Bearbeiter (optional)"
            onChange={setTaskAssignee}
            optionLabel="fullName"
            options={admins}
            value={taskAssignee}
          />
          <Button disabled={!taskName} label="Task erstellen" onClick={createTask} />
        </div>
      </Dialog>
      <Row justifyContent="space-between">
        <h3>Aufgaben</h3>
        <Button
          className="button-secondary"
          label="Aufgabe erstellen"
          onClick={() => setCreating(true)}
        />
      </Row>
      <DataTable
        emptyMessage="Keine Aufgaben gefunden"
        onRowClick={(e) => {
          setSelectedTask(e.data as Task);
          setVisible(true);
        }}
        value={tasks}
      >
        <Column field="title" header="Name" />
        <Column body={assigneeTemplate} header="Bearbeiter" />
        <Column body={statusTemplate} header="Status" />
        <Column body={dueDateTemplate} header="Fällig bis" />
      </DataTable>
    </LayoutColumn>
  );
}
