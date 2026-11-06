import { agencyLoadAll } from '@/app/actions/agency';
import styles from '../../components/admin/Admin.module.css';
import AdminCreateAgency from '@/app/components/admin/agency/AdminCreateAgency';
import AgencyTable from '@/app/components/admin/agency/AgencyTable';
import DividerBlock from '@/app/components/DividerBlock';
import { Metadata } from 'next';
import { agencyOverview } from '@/app/actions/stats';
import { usersLoadAll } from '@/app/actions/users';
import { agentsLoad } from '@/app/actions/users/agent';
import Row from '@/app/components/layout/Row';

export const metadata: Metadata = {
  title: 'Agenturen | ADVACT',
  description: '',
};

export default async function AdminAgenciesPage() {
  const users = await agentsLoad();

  return (
    <div className="page-content">
      <Row alignItems='center' justifyContent='space-between'>
        <h1 className={styles.h1}>Agenturen</h1>
        <AdminCreateAgency />
      </Row>
      <DividerBlock height={2} />
      <AgencyTable users={users} />
    </div>
  );
}
