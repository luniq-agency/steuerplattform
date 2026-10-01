'use client';

import { usePathname } from 'next/navigation';
import AdminSidebar from '@/app/components/admin/sidebar/AdminSidebar';
import { useAuth } from '../context/AuthContext';
import HelpBox from '../components/support/HelpBox';

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
      <div className="page-admin">{children}</div>
      {/*<HelpBox />*/}
    </main>
  );
}