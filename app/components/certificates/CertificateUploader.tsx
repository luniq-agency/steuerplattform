'use client';

import { Button } from 'primereact/button';
import { certificateCreate } from '@/app/actions/certificates';
import styles from './Certificates.module.css';
import { Toast } from 'primereact/toast';
import { User } from '@/app/types/Database';
import { useRef, useState } from 'react';
import { formatYear } from '@/app/utils/formats';
import { useRouter } from 'next/navigation';

interface Props {
  user: User;
}

export default function CertificateUploader({ user }: Props) {
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
      email: user.email,
      user: user.id,
      year,
    };
    try {
      await certificateCreate(file, user.id, payload, year);
      router.refresh();
      toast.current?.show({
        severity: 'success',
        summary: 'Zertifikat hochgeladen',
        detail: 'Das Zertifikat wurde erfolgreich hochgeladen.',
      });
      setSubmitting(false);
      setFile(null);
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
        className="button-secondary"
        disabled={submitting}
        label={file ? file.name : 'Zertifikat hochladen'}
        onClick={file ? upload : startUpload}
        style={{ position: 'relative' }}
      />
    </>
  );
}
