import Sidebar from './Sidebar';
import Navbar from './Navbar';

const DashboardLayout = ({ children, title }) => (
  <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
    <Sidebar />
    <div className="main-pv">
      <Navbar title={title} />
      <main style={{ minHeight: 'calc(100vh - 52px)' }}>
        <div style={{ padding: '28px', maxWidth: '1200px' }} className="animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  </div>
);

export default DashboardLayout;
