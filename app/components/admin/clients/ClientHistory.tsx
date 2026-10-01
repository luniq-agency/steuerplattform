import { UserUpdate } from '@/app/types/Database';
import { DataScroller } from 'primereact/datascroller';
import UserUpdateBox from '../../UserUpdateBox';

interface Props {
  updates: UserUpdate[];
}

export default function ClientHistory({ updates }: Props) {
  return (
    <DataScroller
      emptyMessage="Keine Historie gefunden."
      itemTemplate={(item) => <UserUpdateBox update={item} />}
      rows={10}
      value={updates}
    />
  );
}
