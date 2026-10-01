'use client';

import { ReactNode, useEffect, useState } from 'react';
import styles from './Layout.module.css';

interface Props {
  alignItems?: 'start' | 'center' | 'end';
  children: ReactNode;
  className?: string;
  gap?: number | string;
  grow?: boolean;
  justifyContent?: 'start' | 'center' | 'end' | 'space-between';
  padding?: number | string;
  width?: string | number;
}

export default function Row({
  alignItems,
  children,
  className,
  gap = '1rem',
  grow,
  justifyContent,
  padding,
  width = '100%',
}: Props) {
  return (
    <div
      className={className ? className : styles.row}
      style={{
        alignItems,
        flexGrow: grow ? 1 : 0,
        gap,
        justifyContent,
        padding,
        width,
      }}
    >
      {children}
    </div>
  );
}
