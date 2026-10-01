'use client';

import styles from './Tasks.module.css';
import { Task, User } from '@/app/types/Database';
import { TaskColumn } from './TaskColumn';
import { useEffect, useState } from 'react';
import { tasksLoadAll } from '@/app/actions/tasks';
import { useAuth } from '@/app/context/AuthContext';

interface Props {
  admins: User[];
  tasks: Task[];
  users: User[];
}

export default function TaskKanban({ admins, tasks, users }: Props) {
  const onHold = tasks.filter((t) => t.status === 'on_hold');
  const open = tasks.filter((t) => t.status === 'open');
  const overdue = tasks.filter((t) => t.status === 'overdue');

  return (
    <div className={styles.taskGrid}>
      <TaskColumn
        color="var(--primary)"
        header="In Bearbeitung"
        tasks={open}
        users={users}
      />
      <TaskColumn
        color="var(--error-text)"
        header="Überfällig"
        tasks={overdue}
        users={users}
      />
      <TaskColumn
        color="var(--warning-text)"
        header="Wiedervorlage"
        tasks={onHold}
        users={users}
      />
    </div>
  );
}
