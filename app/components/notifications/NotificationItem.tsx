import { Notification } from '@/app/types/Database';
import styles from './Notifications.module.css';
import { notificationDelete, notificationUpdate } from '@/app/actions/notification';
import { useRef } from 'react';
import { ContextMenu } from 'primereact/contextmenu';
import Link from 'next/link';
import { IconButton } from '../buttons/IconButton';
import { EllipsisVertical } from 'lucide-react';

interface Props {
  notification: Notification;
  onClick: () => void;
}

export default function NotificationItem({ notification, onClick }: Props) {
  const menu = useRef<ContextMenu | null>(null);

  const items = [
    {
      label: 'Als gelesen markieren',
      command: () => markAsRead(),
    },
    {
      label: 'Löschen',
      command: () => deleteNotification(),
    },
  ];

  const target = () => {
    if (notification.type === 'ticket') return `/dashboard/tickets/${notification.ref}`;
    return '/dashboard';
  };

  // ACTIONS
  const deleteNotification = async () => {
    await notificationDelete(notification.id);
  };

  const markAsRead = async () => {
    if (notification.read == true) return;
    const payload = {
      read: true,
    };

    try {
      await notificationUpdate(payload, notification.id);
      onClick();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Link
      className={!notification.read ? `${styles.wrapper} ${styles.unread}` : styles.wrapper}
      href={target()}
      onClick={markAsRead}
      onContextMenu={(e) => menu.current?.show(e)}
    >
      <ContextMenu model={items} ref={menu} breakpoint="767px" />
      <span className="width-100" style={{ fontSize: 12 }}>
        {notification.message}
      </span>
      {!notification.read && <div className="dot-red" />}
      <IconButton
        icon={EllipsisVertical}
        onClick={() => menu.current?.show({} as React.SyntheticEvent)}
      />
    </Link>
  );
}
