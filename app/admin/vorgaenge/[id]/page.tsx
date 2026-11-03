import { BreadCrumb } from 'primereact/breadcrumb';
import { Metadata } from 'next';
import DividerBlock from '@/app/components/DividerBlock';
import { taskLoad } from '@/app/actions/tasks';
import TaskEditor from '@/app/components/admin/tasks/TaskEditor';
import { userLookup } from '@/app/actions/users';
import { fetchVorgangById } from '@/app/actions/vorgang/vorgang';

export const metadata: Metadata = {
  title: 'Aufgabe | ADVACT',
  description: '',
};

export default async function AdminTaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const task = await fetchVorgangById(id);

  if (!task) return;

  return (
    <div className="page-content">
      <div className="row gap-m">
        <TaskEditor task={task} />
      </div>
    </div>
  );
}
