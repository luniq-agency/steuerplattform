'use client';

import { useRef, useState } from 'react';
import styles from './Forms.module.css';
import { TertiaryButton } from '../buttons/Buttons';

interface Props {
  label: string;
  onUpload: (file: File, fileType: string) => void;
}

const getFileType = (file: File): string => {
  const type = file.type;
  const name = file.name.toLowerCase();

  if (type === 'application/pdf') return 'pdf';
  if (
    type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    name.endsWith('.docx')
  )
    return 'docx';
  if (
    type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    name.endsWith('.xlsx')
  )
    return 'xlsx';
  if (type.startsWith('image/')) return 'image';

  return 'other';
};

export function FileUploader({ label, onUpload }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [selected, setSelected] = useState(false);

  // ACTIONS
  const resetValue = () => {
    setSelected(false);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <label className={styles.uploader}>
      <input
        ref={inputRef}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            const fileType = getFileType(file);
            onUpload(file, fileType);
            console.log('Type:', fileType);
            setSelected(true);
          }
        }}
        style={{ display: 'none' }}
        type="file"
      />
      <span>{label}</span>
      {selected && (
        <TertiaryButton
          label="Löschen"
          onClick={(e: any) => {
            e.preventDefault();
            resetValue();
          }}
        />
      )}
    </label>
  );
}
