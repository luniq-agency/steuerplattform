import { User } from '@/app/types/Database';
import Column from '../layout/Column';
import Row from '../layout/Row';
import { UserAvatar, UserAvatarOther } from '../UserAvatar';
import { job_categories } from '@/app/constants/Constants';

interface Props {
  label: string;
  user: User | null;
}

export default function UserDisplay({ label, user }: Props) {
  const status = job_categories.find((j) => j.value === user?.job_status);
  const userName = `${user?.user_name_first} ${user?.user_name_last}`;

  if (!user)
    return (
      <Column gap={4}>
        <label>{label}</label>
        <Row alignItems="center" gap={8}>
          <div
            style={{
              backgroundColor: status ? status.bg : '#ebebeb',
              borderRadius: 200,
              height: 32,
              width: 32,
            }}
          />
          <span>–</span>
        </Row>
      </Column>
    );

  return (
    <Column gap={4}>
      <label>{label}</label>
      <Row alignItems="center" gap={8}>
        <UserAvatarOther
          backgroundColor={status ? status.bg : 'var(--primary)'}
          color={status ? status.color : 'white'}
          fontSize={14}
          height={30}
          user={user}
          width={30}
        />
        <span>{userName}</span>
      </Row>
    </Column>
  );
}
