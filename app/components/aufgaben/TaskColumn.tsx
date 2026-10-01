'use client';

import TaskBox from './TaskBox';
import DividerBlock from '../DividerBlock';
import styles from './Tasks.module.css';
import { Task, User } from '@/app/types/Database';
import { HeaderButton } from '../buttons/Buttons';
import { Plus } from 'lucide-react';
import Row from '../layout/Row';

interface Props {
  color: string;
  header: string;
  tasks?: Task[];
  users: User[];
}

export function TaskColumn({ color, header, tasks, users}: Props) {
  return (
    <div className={styles.taskColumn}>
      <div className={styles.taskHeader} style={{ borderColor: color }}>
        <Row alignItems="center" justifyContent="space-between">
          <h3 className={styles.taskLabel}>{header}</h3>
          <span className={styles.taskCounter}>{tasks?.length || 0}</span>
        </Row>
      </div>
      <DividerBlock height={2} />
      {tasks && tasks.map((t, i) => <TaskBox key={i} task={t} users={users} />)}
    </div>
  );
}
