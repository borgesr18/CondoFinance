import React, { useState } from 'react';
import { Icons } from './ui/Icons';
import { User, Condo } from '../types';
import { canAccess, ModuleId } from '../utils/permissions';

interface LayoutProps {
  user: User;
  condo: Condo;
  children: React.ReactNode;
  activeRoute: string;
  onNavigate: (route: string) => void;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  user, 
  condo, 
  children, 
  activeRoute, 
  onNavigate,
  onLogout
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const allMenuItems: { id: ModuleId; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: Icons.LayoutDashboard },
    { id: 'transactions', label: 'Lançamentos', icon: Icons.ArrowUpRight },
    { id: 'billings', label: 'Cobranças', icon: Icons.Wallet },
    { id: 'units', label: 'Unidades', icon: Icons.Building },
    { id: 'maintenance', label: 'Manutenção', icon: Icons.Wrench },
    { id: 'suppliers', label: 'Fornecedores', icon: Icons.Truck },
    { id: 'reports', label: 'Relatórios', icon: Icons.FileText },
    { id: 'settings', label: 'Configurações', icon: Icons.Settings },
  ];

  // Filter menu based on permissions
  const menuItems = allMenuItems.filter(item => canAccess(user.role, item.id));

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-200 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
            <div className="font-bold text-xl tracking-tight text-white flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Icons.Logo className="h-5 w-5 text-white" />
                </div>
                CondoFinance
            </div>
        </div>
        
        <div className="p-4">
            <div className="mb-6 px-2">
                <p className="text-xs text-slate-400 uppercase font-semibold mb-2">Condomínio</p>
                <div className="text-sm font-medium truncate text-slate-200">{condo.name}</div>
            </div>

            <nav className="space-y-1">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => {
                            onNavigate(item.id);
                            setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                            activeRoute === item.id 
                            ? 'bg-blue-600 text-white font-medium shadow-md' 
                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                    >
                        <item.icon className="h-5 w-5" />
                        {item.label}
                    </button>
                ))}
            </nav>
        </div>

        <div className="absolute bottom-0 w-full p-4 border-t border-slate-800">
            <div className="flex items-center gap-3 px-2">
                <img src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}&background=334155&color=fff`} alt="User" className="w-8 h-8 rounded-full bg-slate-700" />
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{user.name}</p>
                    <p className="text-xs text-slate-400 truncate">{user.role.replace('_', ' ')}</p>
                </div>
                <button onClick={onLogout} className="text-slate-400 hover:text-white">
                    <Icons.LogOut className="h-5 w-5" />
                </button>
            </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Header (Mobile) */}
        <header className="md:hidden h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4">
            <span className="font-bold text-slate-900">CondoFinance</span>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-600">
                <Icons.MoreVertical className="h-6 w-6 rotate-90" />
            </button>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                {children}
            </div>
        </main>
      </div>
      
      {/* Overlay for mobile */}
      {mobileMenuOpen && (
        <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};