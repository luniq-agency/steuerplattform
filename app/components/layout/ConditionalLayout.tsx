'use client';

import { usePathname } from 'next/navigation';
import AdminSidebar from '../admin/sidebar/AdminSidebar';

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');
  return (
    <>
      {!isAdmin && <AdminSidebar />}
      {children}
    </>
  );
}

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hiddenRoutes = ['/ssdere'];
  const hiddenPatterns = [/^\/admin\/immobilien\/[^/]+$/, /^\/admin\/konto-erstellen\/[^/]+$/];
  const showSidebar =
    !hiddenRoutes.includes(pathname) && !hiddenPatterns.some((pattern) => pattern.test(pathname));

  return (
    <main className="page-dashboard">
      {showSidebar && <AdminSidebar />}
      <div className="page-content">{children}</div>
    </main>
  );
}
