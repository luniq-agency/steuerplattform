'use client';

import { CSSProperties, ReactNode, useEffect, useState } from 'react';
import styles from './Layout.module.css';

interface Props {
  alignItems?: 'start' | 'center' | 'end';
  children: ReactNode;
  className?: string;
  gap?: number | string;
  grow?: boolean;
  height?: string | number;
  justifyContent?: 'start' | 'center' | 'end' | 'space-between';
  padding?: number | string;
  style?: CSSProperties;
  width?: string | number;
}

export default function Row({
  alignItems,
  children,
  className,
  gap = '1rem',
  grow,
  height,
  justifyContent,
  padding,
  style,
  width = '100%',
}: Props) {
  return (
    <div
      className={className ? `${className} ${styles.row}` : styles.row}
      style={{
        alignItems,
        flexGrow: grow ? 1 : 0,
        gap,
        height,
        justifyContent,
        padding,
        width,
        ...style
      }}
    >
      {children}
    </div>
  );
}
