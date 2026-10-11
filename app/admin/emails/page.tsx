import EmailAdmin from '@/app/components/admin/emails/EmailAdmin';
import { fetchEmails } from '@/app/actions/email';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'E-Mails | ADVACT',
  description: '',
};

export default async function AdminTasksPage() {
  const emails = await fetchEmails();

  return <EmailAdmin emails={emails} />;
}
