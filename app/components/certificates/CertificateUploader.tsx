'use client';

import { certificateCreate } from '@/app/actions/certificates';
import { Toast } from 'primereact/toast';
import { User } from '@/app/types/Database';
import { useRef, useState } from 'react';
import { formatYear } from '@/app/utils/formats';
import { useRouter } from 'next/navigation';
import Button from '../buttons/Button';
import { Upload } from 'lucide-react';

interface Props {
  onUpload?: () => void;
  user: User;
}

export default function CertificateUploader({ onUpload, user }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();
  const toast = useRef<Toast | null>(null);

  const [submitting, setSubmitting] = useState(false);

  const [file, setFile] = useState<File | null>(null);

  const startUpload = () => {
    inputRef.current?.click();
  };

  const upload = async () => {
    if (!user || !file) return;
    setSubmitting(true);

    const year = formatYear(new Date());
    const payload = {
      name: file.name,
      user: user.id,
      year: Number(year),
    };
    try {
      await certificateCreate(file, String(user.id), payload, year);
      setSubmitting(false);
      setFile(null);
      onUpload && onUpload();
    } catch (err) {
      console.error(err);
      toast.current?.show({
        severity: 'error',
        summary: 'Fehler aufgetreten',
        detail: 'Das Zertifikat konnte nicht hochgeladen werden. Bitte probiere es erneut.',
      });
      setSubmitting(false);
    }
  };

  return (
    <>
      <Toast ref={toast} />
      <input
        accept=".pfx"
        ref={inputRef}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) {
            setFile(f);
          }
        }}
        style={{ display: 'none' }}
        type="file"
      />
      <Button
        disabled={submitting}
        icon={Upload}
        label={file ? file.name : 'Zertifikat hochladen'}
        mode="secondary"
        onClick={file ? upload : startUpload}
        size="small"
      />
    </>
  );
}
