import { agencyLoadAll } from '@/app/actions/agency';
import styles from '../../components/admin/Admin.module.css';
import AdminCreateAgency from '@/app/components/admin/agency/AdminCreateAgency';
import AgencyTable from '@/app/components/admin/agency/AgencyTable';
import DividerBlock from '@/app/components/DividerBlock';
import { Metadata } from 'next';
import AdminsTable from '@/app/components/admin/admins/AdminTable';
import AdminCreateAdmin from '@/app/components/admin/admins/AdminCreateAdmin';
import { adminsLoadAll } from '@/app/actions/admin';

export const metadata: Metadata = {
  title: 'Admins | CONEK',
  description: '',
};

export default async function AdminAdminsPage() {
  const admins = await adminsLoadAll();

  return (
    <div className="page-content">
      <div className="row space-between">
        <h1 className={styles.h1}>Admins</h1>
        <AdminCreateAdmin />
      </div>
      <DividerBlock height={2} />
      <div className="container">
        <AdminsTable admins={admins} />
      </div>
    </div>
  );
}
