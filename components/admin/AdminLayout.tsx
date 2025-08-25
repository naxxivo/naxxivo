import React, { useState } from 'react';
import DashboardPage from './pages/DashboardPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import AdminPaymentsPage from './pages/AdminPaymentsPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminProductsPage from './pages/AdminProductsPage';

type AdminView = 'dashboard' | 'products' | 'orders' | 'users' | 'payments';

interface AdminLayoutProps {
  onNavigateHome: () => void;
}

const NavItem: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-yellow-400 text-black shadow'
        : 'text-gray-600 hover:bg-gray-200'
    }`}
  >
    {label}
  </button>
);

const AdminLayout: React.FC<AdminLayoutProps> = ({ onNavigateHome }) => {
  const [currentView, setCurrentView] = useState<AdminView>('dashboard');

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardPage />;
      case 'orders':
        return <AdminOrdersPage />;
      case 'payments':
        return <AdminPaymentsPage />;
      case 'users':
        return <AdminUsersPage />;
      case 'products':
        return <AdminProductsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-white p-4 shadow-lg flex-shrink-0">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tighter">
            Nax<span className="text-yellow-400">Store</span>
          </h1>
          <p className="text-sm text-gray-500">Admin Panel</p>
        </div>
        <nav className="space-y-2">
          <NavItem label="Dashboard" isActive={currentView === 'dashboard'} onClick={() => setCurrentView('dashboard')} />
          <NavItem label="Products" isActive={currentView === 'products'} onClick={() => setCurrentView('products')} />
          <NavItem label="Orders" isActive={currentView === 'orders'} onClick={() => setCurrentView('orders')} />
          <NavItem label="Payments" isActive={currentView === 'payments'} onClick={() => setCurrentView('payments')} />
          <NavItem label="Users" isActive={currentView === 'users'} onClick={() => setCurrentView('users')} />
        </nav>
        <div className="mt-auto pt-4 border-t">
           <button onClick={onNavigateHome} className="w-full text-left px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-200">
                &larr; Back to Store
            </button>
        </div>
      </aside>
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {renderView()}
      </main>
    </div>
  );
};

export default AdminLayout;