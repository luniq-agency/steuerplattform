import { emailTemplatesLoad } from '@/app/actions/emailtemplates';
import AdminTemplateCreate from '@/app/components/admin/emails/AdminTemplateCreate';
import EmailTemplatesTable from '@/app/components/admin/emails/EmailTemplatesTable';
import DividerBlock from '@/app/components/DividerBlock';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'E-Mail-Vorlagen | CONEK',
  description: '',
};

export default async function AdminTasksPage() {
  const templates = await emailTemplatesLoad();

  return (
    <div className="page-content">
      <div className="row space-between">
        <h1>E-Mail-Vorlagen</h1>
        <AdminTemplateCreate />
      </div>
      <DividerBlock height={2} />
      <div className="container">
        <EmailTemplatesTable templates={templates} />
      </div>
    </div>
  );
}
