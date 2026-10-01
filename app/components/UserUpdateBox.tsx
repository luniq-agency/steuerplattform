import { Ticket, UserUpdate } from '@/app/types/Database';
import styles from './tickets/Tickets.module.css';
import { Avatar } from 'primereact/avatar';
import { Tag } from 'primereact/tag';
import { formatDate, formatDateWithTime } from '@/app/utils/formats';
import { ticket_options, ticket_status } from '@/app/constants/Constants';
import { UserAvatar } from './UserAvatar';

interface Props {
  update: UserUpdate;
}

export default function UserUpdateBox({ update }: Props) {
  return (
    <div className={styles.wrapper}>
      <div className="column width-100">
        <div className="row space-between">
          <div className="row gap-m">
            <UserAvatar fontSize={16} height={32} width={32} />
            <div className="column">
              <span className={styles.titleSmall}>{update.created_by}</span>
              <span className={styles.textMeta}>{update.body}</span>
            </div>
          </div>
          <span className={styles.textMeta}>{formatDateWithTime(update.created_at)}</span>
        </div>
      </div>
    </div>
  );
}
