import AgencySidebar from '../components/sidebar/AgencySidebar';
import AgencyTopbar from '../components/sidebar/AgencyTopbar';

export default function AgencyLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="page-dashboard" style={{ backgroundColor: 'white' }}>
      <AgencySidebar />
      <div className="page-content" style={{ padding: 0 }}>
        <AgencyTopbar />
        {children}
      </div>
    </main>
  );
}
