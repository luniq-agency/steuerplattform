import { Metadata } from 'next';
import PageTicketErstellen from './PageTicketErstellen';

export const metadata: Metadata = {
  title: 'Neues Ticket erstellen | CONEK',
  description: '',
};

export default function Page() {
  return (
    <div className="content-wrapper" style={{ height: '100%', padding: 16 }}>
      <PageTicketErstellen />
    </div>
  );
}
