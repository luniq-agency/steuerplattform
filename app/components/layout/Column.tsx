'use client';

import { ReactNode, useEffect, useState } from 'react';
import styles from './Layout.module.css';

interface Props {
  alignItems?: 'start' | 'center' | 'end';
  children: ReactNode;
  className?: any;
  gap?: number | string;
  grow?: boolean;
  justifyContent?: 'start' | 'center' | 'end';
  maxWidth?: string | number | undefined;
  padding?: string | number;
  width?: string | number;
}

export default function Column({ alignItems, children, className, gap = '1rem', grow, justifyContent, maxWidth, padding, width = '100%' }: Props) {
  return (
    <div
      className={`${styles.column} ${className}`}
      style={{
        alignItems,
        flexGrow: grow ? 1 : undefined,
        gap,
        justifyContent,
        maxWidth,
        padding,
        width,
      }}
    >
      {children}
    </div>
  );
}
