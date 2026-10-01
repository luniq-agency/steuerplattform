import { BreadCrumb } from 'primereact/breadcrumb';
import { Metadata } from 'next';
import DividerBlock from '@/app/components/DividerBlock';
import { taskLoad } from '@/app/actions/tasks';
import TaskEditor from '@/app/components/admin/tasks/TaskEditor';
import { userLookup } from '@/app/actions/users';

export const metadata: Metadata = {
  title: 'Aufgabe | CONEK',
  description: '',
};

export default async function AdminTaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const task = await taskLoad(id);

  const items = [
    {
      label: 'Aufgaben',
      url: '/admin/aufgaben',
    },
    {
      label: `${task.title}`,
    },
  ];

  const home = { icon: 'pi pi-home', url: '/admin' };

  if (!task) return;

  return (
    <div className="page-content">
      <BreadCrumb home={home} model={items} />
      <DividerBlock height={2} />
      <div className="row gap-m">
        <TaskEditor task={task} />
      </div>
    </div>
  );
}
