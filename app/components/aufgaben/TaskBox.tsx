import { formatDate } from '@/app/utils/formats';
import Link from 'next/link';
import styles from './Tasks.module.css';
import { priority_options, task_status } from '@/app/constants/Constants';
import { Task, User } from '@/app/types/Database';
import { UserAvatarOther } from '../UserAvatar';
import Tag from '../ui/Tag';
import DividerBlock from '../DividerBlock';
import DividerLine from '../ui/DividerLine';
import UserDisplay from '../users/UserDisplay';
import { filterClientsAll } from '@/app/actions/users/filter';
import Row from '../layout/Row';

interface Props {
  task: Task;
  users: User[];
}

export default function TaskBox({ task, users }: Props) {
  const assignee = users.find((t) => t.id === task.assignee);
  const client = users.find((c) => c.id === task.user);

  const isOverdue = task.due_date && new Date(task.due_date) < new Date();
  const status = task_status.find((t) => t.value === task.status);

  const priority = priority_options.find((p) => p.value === task.priority);

  return (
    <Link className={styles.taskBox} href={`/admin/aufgaben/${task.id}`}>
      <div className="row space-between">
        <span style={{ fontWeight: 600 }}>{task.title}</span>
        {task.due_date && (
          <span style={{ color: isOverdue ? 'red' : 'black', fontSize: 14 }}>
            {formatDate(task.due_date)}
          </span>
        )}
        {priority && (
          <Tag
            bgColor={priority?.bg || 'var(--primary)'}
            color={priority?.color || 'white'}
            text={priority?.label || 'Status'}
          />
        )}
      </div>
      <DividerBlock height={1} />
      <DividerLine />
      <DividerBlock height={1} />
      <div className="row space-between align-center">
        <Row justifyContent="space-between">
          <UserDisplay label="Kunde" user={client || null} />
          <UserDisplay label="Bearbeiter" user={assignee || null} />
        </Row>
      </div>
    </Link>
  );
}
