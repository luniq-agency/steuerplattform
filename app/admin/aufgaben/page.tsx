import AufgabenPage from './AufgabenPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Aufgaben | CONEK',
  description: '',
};

export default function Page() {
  return <AufgabenPage />;
}
