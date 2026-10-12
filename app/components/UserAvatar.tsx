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
  onClick?: () => void;
  user?: User;
  width: number;
}

export function UserAvatar({ backgroundColor, color, collapsed, fontSize, height, onClick, width }: Props) {
  const { userProfile } = useAuth();

  const label = userProfile?.vorname[0];
  if (!userProfile?.avatar)
    return (
      <Avatar
        label={label}
        onClick={onClick}
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
      alt={`${userProfile.vorname} ${userProfile.nachname}`}
      style={{ borderRadius: '200%', height, width }}
      src={userProfile.avatar}
    />
  );
}

export function UserAvatarOther({ backgroundColor, color, fontSize, height, user, width }: Props) {
  const label = `${user?.vorname[0]}${user?.nachname[0]}`;

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
      alt={`${user.vorname} ${user.nachname}`}
      height={height}
      src={user.avatar}
      style={{ borderRadius: '200%' }}
      width={width}
    />
  );
}
