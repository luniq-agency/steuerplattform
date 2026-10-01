import { Document } from '@/app/types/Database';
import DocDoc from './previews/DocDoc';
import DocPDF from './previews/DocPdf';
import DocXLS from './previews/DocExcel';

interface Props {
  doc: Document;
}

export default function DocumentPreviewer({ doc }: Props) {
  const getDocType = () => {
    if (doc.file_type === 'pdf') return <DocPDF src={doc.document_file} />;
    if (doc.file_type === 'docx' || doc.file_type === 'doc')
      return <DocDoc src={doc.document_file} />;
    if (doc.file_type === 'xlsx' || doc.file_type === 'xls')
      return <DocXLS src={doc.document_file} />;
    if (doc.file_type === 'image' || doc.file_type === 'png' || doc.file_type === 'jpg')
      return (
        <img
          src={doc.document_file}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      );
    return null;
  };

  return <div style={{ height: '100%', width: "100%"}}>{getDocType()}</div>;
}
