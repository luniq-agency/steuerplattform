import DashboardSidebar from '../components/clients/dashboard/DashboardSidebar';
import AgencySidebar from '../components/sidebar/AgencySidebar';

export default function AgencyLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="page-dashboard" style={{ backgroundColor: 'white' }}>
      <AgencySidebar />
      <div className="page-content" style={{ padding: 0 }}>
        {children}
      </div>
    </main>
  );
}
