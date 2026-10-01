import styles from '../../components/admin/Admin.module.css';
import { Metadata } from 'next';
import DividerBlock from '@/app/components/DividerBlock';
import { clientsLoadAll } from '@/app/actions/clients';

export const metadata: Metadata = {
  title: 'Meetings | CONEK',
  description: '',
};

export default async function AdminClientsPage() {

  return (
    <div className="page-content" style={{ height: '100%' }}>
      <div className="row space-between">
        <h1 className={styles.h1}>Meetings</h1>
      </div>
      <DividerBlock height={2} />
    </div>
  );
}
