'use client';

import { Avatar } from 'primereact/avatar';
import { useAuth } from '../context/AuthContext';
import Image from 'next/image';
import { User } from '../types/Database';

interface Props {
  backgroundColor?: string;
  color?: string;
  collapsed?: boolean;
  fontSize: number;
  height: number;
  user?: User;
  width: number;
}

export function UserAvatar({ backgroundColor, color, collapsed, fontSize, height, width }: Props) {
  const { userProfile } = useAuth();

  const label = userProfile?.user_name_first[0];
  if (!userProfile?.avatar)
    return (
      <Avatar
        label={label}
        shape="circle"
        style={{
          backgroundColor: 'var(--secondary)',
          color: 'var(--text-primary)',
          flexShrink: 0,
          fontSize,
          fontWeight: 700,
          height,
          width,
        }}
      />
    );

  return (
    <img
      alt={`${userProfile.user_name_first} ${userProfile.user_name_last}`}
      style={{ borderRadius: '200%', height, width }}
      src={userProfile.avatar}
    />
  );
}

export function UserAvatarOther({ backgroundColor, color, fontSize, height, user, width }: Props) {
  const label = `${user?.user_name_first[0]}${user?.user_name_last[0]}`;

  if (!user) return <Avatar label="?" shape="circle" />;

  if (!user?.avatar)
    return (
      <Avatar
        label={label}
        shape="circle"
        style={{
          backgroundColor,
          color,
          fontSize,
          fontWeight: 700,
          height,
          width,
        }}
      />
    );

  return (
    <Image
      alt={`${user.user_name_first} ${user.user_name_last}`}
      height={height}
      src={user.avatar}
      style={{ borderRadius: '200%' }}
      width={width}
    />
  );
}
