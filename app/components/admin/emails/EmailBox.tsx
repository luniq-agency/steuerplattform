import { Email, Ticket } from '@/app/types/Database';
import styles from '../../tickets/Tickets.module.css';
import { Avatar } from 'primereact/avatar';
import { Tag } from 'primereact/tag';
import { formatDate, stripHtml } from '@/app/utils/formats';
import { ticket_options, ticket_status } from '@/app/constants/Constants';

interface Props {
  email: Email;
  onClick: () => void;
  selected: boolean;
}

export default function EmailBox({ email, onClick, selected }: Props) {
  return (
    <div
      className={selected ? `${styles.wrapper} ${styles.selected}` : styles.wrapper}
      onClick={onClick}
    >
      <div className="column width-100">
        <div className="row space-between">
          <div className="column">
            <span className={styles.titleSmall}>{email.subject}</span>
            <span className={styles.textMeta}></span>
          </div>
          <div className="column align-end">
            <span className={styles.textMeta}>{formatDate(email.received_at)}</span>
          </div>
        </div>
        <span className={styles.textDescription}>{stripHtml(email.body)}</span>
      </div>
    </div>
  );
}
