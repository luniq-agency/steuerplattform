'use client';

import DocDoc from './previews/DocDoc';
import DocPDF from './previews/DocPdf';
import DocXLS from './previews/DocExcel';
import { Dokument } from '@/app/types/docs';
import { useEffect, useState } from 'react';
import { dokumentUrl } from '@/app/actions/documents/url';

interface Props {
  doc: Dokument;
}

const BILDTYPEN = ['image', 'image/png', 'image/jpeg', 'image/webp', 'image/gif', 'png', 'jpg', 'jpeg', 'webp'];

export default function DocumentPreviewer({ doc }: Props) {
  const [url, setUrl] = useState<string | null>(null);
  const [fehler, setFehler] = useState('');

  useEffect(() => {
    setUrl(null);
    setFehler('');
    dokumentUrl(doc.id).then((res) => {
      if (res.url) setUrl(res.url);
      else setFehler(res.error ?? 'Die Datei konnte nicht geladen werden.');
    });
  }, [doc.id]);

  if (fehler) return <p>{fehler}</p>;
  if (!url) return <p>Dokument wird geladen …</p>;

  const typ = (doc.type ?? '').toLowerCase();

  const vorschau = () => {
    if (typ === 'application/pdf' || typ === 'pdf') return <DocPDF src={url} />;
    if (typ === 'docx' || typ === 'doc' || typ.includes('wordprocessingml') || typ === 'application/msword')
      return <DocDoc src={url} />;
    if (typ === 'xlsx' || typ === 'xls' || typ.includes('spreadsheetml') || typ === 'application/vnd.ms-excel')
      return <DocXLS src={url} />;
    if (BILDTYPEN.includes(typ))
      return <img alt={doc.name ?? ''} src={url} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />;

    return (
      <p>
        Für diesen Dateityp gibt es keine Vorschau.{' '}
        <a href={url} rel="noreferrer" target="_blank">
          Datei herunterladen
        </a>
      </p>
    );
  };

  return <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, height: "100%", width: '100%' }}>{vorschau()}</div>;
}