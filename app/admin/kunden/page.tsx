import { Metadata } from 'next';
import Kunden from './Kunden';

export const metadata: Metadata = {
  title: 'Kunden | ADVACT',
  description: '',
};

export default function AdminClientsPage() {
  return (
    <Kunden/>
  ); 
}
