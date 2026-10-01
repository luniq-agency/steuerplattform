import { BreadCrumb } from 'primereact/breadcrumb';
import { Metadata } from 'next';
import DividerBlock from '@/app/components/DividerBlock';
import { emailTemplateLoad } from '@/app/actions/emailtemplates';
import EmailTemplateEditor from '@/app/components/admin/emails/EmailTemplateEditor';

export const metadata: Metadata = {
  title: 'E-Mail-Vorlage bearbeiten | CONEK',
  description: '',
};

export default async function AdminEmailEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const template = await emailTemplateLoad(id);

  const home = { icon: 'pi pi-home', url: '/admin' };

  if (!template) return;

  return (
    <div className="page-content">
      <EmailTemplateEditor template={template} />
    </div>
  );
}
