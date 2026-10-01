import { Ticket } from '@/app/types/Database';
import styles from './Tickets.module.css';
import { Avatar } from 'primereact/avatar';
import { Tag } from 'primereact/tag';
import { formatDate } from '@/app/utils/formats';
import { ticket_options, ticket_status } from '@/app/constants/Constants';
import { UserAvatar } from '../UserAvatar';

interface Props {
  onClick: () => void;
  selected: boolean;
  ticket: Ticket;
}

export default function TicketBox({ onClick, selected, ticket }: Props) {
  const category = ticket_options.find((t) => t.value === ticket.category);
  const categoryLabel = category?.label;

  const statusObj = ticket_status.find((t) => t.value === ticket.status);
  const severity = statusObj?.severity as any;
  const label = statusObj?.label;

  return (
    <div
      className={selected ? `${styles.wrapper} ${styles.selected}` : styles.wrapper}
      onClick={onClick}
    >
      <div className="column width-100">
        <div className="row space-between">
          <div className="column">
            <span className={styles.titleSmall}>{ticket.name}</span>
            <span className={styles.textMeta}>{categoryLabel}</span>
          </div>
          <div className="column align-end">
            <Tag severity={severity} style={{ width: 'fit-content' }} value={label} />
            <span className={styles.textMeta}>{formatDate(ticket.created_at)}</span>
          </div>
        </div>
        <span className={styles.textDescription}>{ticket.description}</span>
      </div>
    </div>
  );
}
