
import DocDoc from './previews/DocDoc';
import DocPDF from './previews/DocPdf';
import DocXLS from './previews/DocExcel';
import { Dokument } from '@/app/types/docs';

interface Props {
  doc: Dokument;
}

export default function DocumentPreviewer({ doc }: Props) {
  const getDocType = () => {
    if (doc.type === 'pdf') return <DocPDF src={doc.file} />;
    if (doc.type === 'docx' || doc.type === 'doc')
      return <DocDoc src={doc.file} />;
    if (doc.type === 'xlsx' || doc.type === 'xls')
      return <DocXLS src={doc.file} />;
    if (doc.type === 'image' || doc.type === 'png' || doc.type === 'jpg')
      return (
        <img
          src={doc.file}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      );
    return null;
  };

  return <div style={{ height: '100%', width: "100%" }}>{getDocType()}</div>;
}
