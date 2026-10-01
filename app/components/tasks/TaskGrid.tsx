'use client';

import { Task, User } from '@/app/types/Database';
import { Button } from 'primereact/button';
import TaskBox from '../aufgaben/TaskBox';
import { useEffect, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { SelectLabel, TextAreaLabel, TextInputLabel } from '../forms/FormElements';
import { taskCreate, tasksLoadUser } from '@/app/actions/tasks';
import { useAuth } from '@/app/context/AuthContext';

interface Props {
  admins: User[];
  user: User;
}

export default function TasksGrid({ admins, user }: Props) {
  const { userProfile } = useAuth();

  // STATES
  const [creating, setCreating] = useState(false);

  // DATA
  const [tasks, setTasks] = useState<Task[]>([]);

  // INIT
  useEffect(() => {
    if (!user) return;

    const fetchTasks = async () => {
      try {
        const taskRes = await tasksLoadUser(user.id);
        setTasks(taskRes);
      } catch (err) {}
    };

    fetchTasks();
  }, [user]);

  const refreshData = async () => {
    const res = await tasksLoadUser(user.id);
    setTasks(res);
  };

  // INPUTS
  const [taskAssignee, setTaskAssignee] = useState<User | null>(null);
  const [taskDescription, setTaskDescription] = useState('');
  const [taskDueDate, setTaskDueDate] = useState<Date | null>(null);
  const [taskName, setTaskName] = useState('');

  // ACTIONS
  const createTask = async () => {
    if (!userProfile) return;

    const taskPayload = {
      description: taskDescription,
      due_date: taskDueDate,
      status: 'open',
      title: taskName,
      user: user.id,
    };

    try {
      await taskCreate(taskPayload, userProfile);
      refreshData();
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
      setTaskAssignee(null);
      setTaskDescription('');
      setTaskDueDate(null);
      setTaskName('');
    }
  };

  return (
    <div className="column gap-m">
      <Dialog
        draggable={false}
        header="Task erstellen"
        onHide={() => setCreating(false)}
        style={{ maxWidth: 400, width: '100%' }}
        visible={creating}
      >
        <div className="column gap-m">
          <TextInputLabel label="Name des Tasks" onChange={setTaskName} value={taskName} />
          <TextAreaLabel
            label="Beschreibung"
            onChange={setTaskDescription}
            value={taskDescription}
          />
          <SelectLabel label="Bearbeiter (optional)" value={taskAssignee?.id} />
          <Button disabled={!taskName} label="Task erstellen" onClick={createTask} />
        </div>
      </Dialog>
      <div className="column gap-s">
        <div className="row space-between">
          <h3>Aufgaben</h3>
          <Button
            className="button-secondary"
            label="Task erstellen"
            onClick={() => setCreating(true)}
          />
        </div>
        {/*
        {tasks.map((t, i) => (
          <TaskBox task={t} users={users} />
        ))}
          */}
        <div className="grid columns-three gap-m"></div>
      </div>
    </div>
  );
}
