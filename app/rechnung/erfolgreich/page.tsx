import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ADVACT',
  description: '',
};

export default function ErfolgPage() {
  return (
    <div className="page-content column" style={{ textAlign: 'center', paddingTop: 80 }}>
      <h1>Vielen Dank für deine Zahlung!</h1>
      <p>Deine Rechnung wurde erfolgreich beglichen.</p>
    </div>
  );
}
