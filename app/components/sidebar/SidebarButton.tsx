import { Button } from 'primereact/button';
import Link from 'next/link';
import styles from './Sidebar.module.css';
import { usePathname } from 'next/navigation';
import { LucideIcon } from 'lucide-react';

interface Props {
  action?: () => void;
  collapsed?: boolean;
  exact?: boolean;
  icon?: LucideIcon;
  label: string;
  target?: string;
}

export default function AdminSidebarButton({ action, collapsed, exact, icon: Icon, label, target }: Props) {
  const pathname = usePathname();

  const isActive = !!target && (
    exact
      ? pathname === target
      : pathname === target || pathname.startsWith(target + '/')
  );


  if (!target) return (
    <Button
      className={`${styles.sidebarButton} ${isActive ? styles.sidebarButtonActive : ''}`}
      onClick={action}
      style={{ gap: 8 }}
    >
      {Icon && <Icon size={16} />}
      {label}
    </Button>
  )

  return (
    <Link
      href={target as any}
      style={{ width: '100%' }}
    >
      <Button
        className={`${styles.sidebarButton} ${isActive ? styles.sidebarButtonActive : ''}`}
        style={{ gap: 8 }}
      >
        {Icon && <Icon size={16} />}
        {label}
      </Button>
    </Link>
  );
}

export function AdminNavbarButton({ action, icon: Icon, label, target }: Props) {
  if (!target)
    return (
      <Button className={styles.navbarButton} onClick={action} style={{ gap: 8 }}>
        {Icon && <Icon size={12} />}
        {label}
      </Button>
    );

  return (
    <Link href={target} style={{ width: '100%' }}>
      <Button className={styles.navbarButton} style={{ gap: 8 }}>
        {Icon && <Icon size={12} />}
        {label}
      </Button>
    </Link>
  );
}
