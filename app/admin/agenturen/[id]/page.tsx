import { BreadCrumb } from 'primereact/breadcrumb';
import { Metadata } from 'next';
import DividerBlock from '@/app/components/DividerBlock';
import { clientsLoadAgency } from '@/app/actions/clients';
import { agencyLoad } from '@/app/actions/agency';
import AgencyTabs from '@/app/components/admin/agency/AgencyTabs';
import { usersLoadAll } from '@/app/actions/users';
import AgencyActions from '@/app/components/agency/AgencyActions';

export const metadata: Metadata = {
  title: 'Agentur | CONEK',
  description: '',
};

export default async function AdminAgencyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const agency = await agencyLoad(id);
  const clients = await clientsLoadAgency(id);
  const users = await usersLoadAll();

  const items = [
    {
      label: 'Agenturen',
      url: '/admin/agenturen',
    },
    {
      label: `${agency.user_name_last}, ${agency.user_name_first}`,
    },
  ];

  const home = { icon: 'pi pi-home', url: '/admin' };

  if (!agency) return;

  return (
    <div className="page-content">
      <BreadCrumb home={home} model={items} />
      <DividerBlock height={1} />
      <div className="row space-between align-center">
        <div className="column">
          <h1>
            {agency.user_name_last}, {agency.user_name_first}
          </h1>
          <span className="meta">{agency.firma}</span>
        </div>
        <AgencyActions agent={agency} />
      </div>
      <DividerBlock height={1} />
      <div className="dashboard-container">
        <AgencyTabs agent={agency} />
      </div>
    </div>
  );
}
