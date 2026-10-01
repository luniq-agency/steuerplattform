import { Button } from 'primereact/button';
import styles from './Admin.module.css';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Props {
  action?: () => void;
  collapsed?: boolean;
  icon?: string;
  label: string;
  target?: string;
}

export default function AdminSidebarButton({ action, collapsed, icon, label, target }: Props) {
  const pathname = usePathname();
  const isActive = pathname === target || pathname.startsWith(target + '/');

  if (!target && !collapsed)
    return (
      <Button
        className={`${styles.sidebarButton} ${isActive ? styles.navButtonActive : ''}`}
        disabled={isActive}
        icon={icon}
        onClick={action}
        style={{ gap: 8 }}
      >
        {label}
      </Button>
    );

  if (!target && collapsed)
    return (
      <Button
        className={`${styles.sidebarButton} ${isActive ? styles.navButtonActive : ''}`}
        disabled={isActive}
        icon={icon}
        onClick={action}
        style={{ gap: 8 }}
        text
      />
    );

  if (target && collapsed)
    return (
      <Link
        className={isActive ? styles.navButtonActiveLink : ''}
        href={target}
        style={{ width: '100%' }}
      >
        <Button
          className={`${styles.sidebarButton} ${isActive ? styles.navButtonActive : ''}`}
          icon={icon}
          style={{ gap: 8 }}
          text
        />
      </Link>
    );

  return (
    <Link
      className={isActive ? styles.navButtonActiveLink : ''}
      href={target as any}
      style={{ width: '100%' }}
    >
      <Button
        className={`${styles.sidebarButton} ${isActive ? styles.navButtonActive : ''}`}
        icon={icon}
        style={{ gap: 8 }}
      >
        {label}
      </Button>
    </Link>
  );
}

export function AdminNavbarButton({ action, icon, label, target }: Props) {
  if (!target)
    return (
      <Button className={styles.navbarButton} icon={icon} onClick={action} style={{ gap: 8 }}>
        {label}
      </Button>
    );

  return (
    <Link href={target} style={{ width: '100%' }}>
      <Button className={styles.navbarButton} icon={icon} style={{ gap: 8 }}>
        {label}
      </Button>
    </Link>
  );
}
