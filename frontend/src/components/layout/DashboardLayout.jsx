import Sidebar from './Sidebar';
import Navbar from './Navbar';

const DashboardLayout = ({ children, title }) => {
  return (
    <div className="min-h-screen bg-obsidian-950">
      <Sidebar />
      <div className="ml-60">
        <Navbar title={title} />
        <main className="pt-14 min-h-screen">
          <div className="p-6 animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
