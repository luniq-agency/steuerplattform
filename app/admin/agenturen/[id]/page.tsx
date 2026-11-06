import { BreadCrumb } from 'primereact/breadcrumb';
import { Metadata } from 'next';
import DividerBlock from '@/app/components/DividerBlock';
import { clientsLoadAgency } from '@/app/actions/clients';
import { agencyLoad } from '@/app/actions/agency';
import { usersLoadAll } from '@/app/actions/users';
import AgencyActions from '@/app/components/agency/AgencyActions';
import Row from '@/app/components/layout/Row';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import AgencyTable from '@/app/components/admin/agency/AgencyTable';
import AgencyClientTable from '@/app/components/users/AgencyClientTable';

export const metadata: Metadata = {
  title: 'Agentur | ADVACT',
  description: '',
};

export default async function AdminAgencyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const agency = await agencyLoad(id);
  const clients = await clientsLoadAgency(id);
  const users = await usersLoadAll();


  if (!agency) return;

  return (
    <div className="page-content" style={{ padding: 16 }}>
      <Row alignItems='center' justifyContent='space-between'>
        <h1>{agency.nachname}, {agency.vorname}</h1>
        <AgencyActions agent={agency} />
      </Row>
      <DividerBlock height={1} />
      <AgencyClientTable agent={agency} clients={clients} mode="admin" />
    </div >
  );
}
