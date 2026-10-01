'use client';

import { Eye, EyeOff, KeyRound } from 'lucide-react';
import styles from './Forms.module.css';
import { useState } from 'react';

interface PasswordProps {
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}

export function AuthPasswordInput({ onChange, placeholder, value }: PasswordProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={styles.authInputWrapper}>
      <KeyRound color="var(--primary)" size={18} />
      <input
        className={styles.authInput}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        type={visible ? 'text' : 'password'}
        value={value}
      />
      <button
        type="button"
        onClick={() => setVisible(!visible)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
