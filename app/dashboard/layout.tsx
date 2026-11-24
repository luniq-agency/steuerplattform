import DashboardSidebar from '../components/sidebar/DashboardSidebar';
import DashboardTopBar from '../components/sidebar/DashboardTopbar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="page-dashboard" style={{ backgroundColor: 'white' }}>
      <DashboardSidebar />
      <div className="page-content" style={{ padding: 0 }}>
        <DashboardTopBar />
        {children}
      </div>
    </main>
  );
}
