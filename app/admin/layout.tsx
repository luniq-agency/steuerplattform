'use client';

import { usePathname } from 'next/navigation';
import AdminSidebar from '@/app/components/sidebar/Sidebar';
import { useAuth } from '../context/AuthContext';
import HelpBox from '../components/support/HelpBox';
import Topbar from '../components/sidebar/TopBar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { initialLoading } = useAuth();
  const pathname = usePathname();

  const hiddenPatterns = [/^\/admin\/immobilien\/[^/]+$/, /^\/admin\/konto-erstellen\/[^/]+$/];
  const showSidebar = !hiddenPatterns.some((pattern) => pattern.test(pathname));

  if (initialLoading) return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh'
    }}>
      <i className="pi pi-spinner pi-spin" style={{ fontSize: 24 }} />
    </div>
  );

  return (
    <main className="page-dashboard">
      {showSidebar && <AdminSidebar />}
      <div className="page-admin">
        <Topbar />
        {children}
      </div>
      {/*<HelpBox />*/}
    </main>
  );
}