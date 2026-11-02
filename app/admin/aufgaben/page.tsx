import Aufgaben from './Aufgaben';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Aufgaben | ADVACT',
  description: '',
};

export default function Page() {
  return <Aufgaben />;
}
