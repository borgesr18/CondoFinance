import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Transactions } from './components/Transactions';
import { Billings } from './components/Billings';
import { Units } from './components/Units';
import { Suppliers } from './components/Suppliers';
import { Maintenance } from './components/Maintenance';
import { Reports } from './components/Reports';
import { Settings } from './components/Settings';
import { Auth } from './components/Auth';
import { MOCK_USER, MOCK_CONDO, MOCK_SUMMARY, MOCK_TRANSACTIONS, MOCK_BILLINGS, MOCK_UNITS, MOCK_SUPPLIERS, MOCK_MAINTENANCE } from './constants';
import { canAccess, ModuleId } from './utils/permissions';
import { User, UserRole } from './types';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [currentRoute, setCurrentRoute] = useState<ModuleId>('dashboard');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Timeout de segurança: 1 segundo para garantir que a UI apareça
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    const init = async () => {
      try {
        if (!isSupabaseConfigured || !supabase) {
          return;
        }

        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        
        if (currentSession) {
          await fetchUserProfile(currentSession.user.id);
        }
      } catch (e) {
        console.error("Erro na inicialização do App:", e);
      } finally {
        setIsLoading(false);
        clearTimeout(timer);
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession) {
        fetchUserProfile(newSession.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const fetchUserProfile = async (uid: string) => {
    if (!supabase) return;
    try {
      const { data } = await supabase.from('perfis').select('*').eq('id', uid).maybeSingle();
      if (data) {
        setProfile({
          id: data.id,
          name: data.nome || 'Usuário',
          email: data.email || '',
          role: (data.role as UserRole) || 'MORADOR',
          avatarUrl: data.avatar_url
        });
      } else {
        // Fallback imediato se o perfil não existir ainda
        setProfile({
          id: uid,
          name: 'Novo Usuário',
          email: session?.user?.email || '',
          role: 'ADMIN_CONDOMINIO'
        });
      }
    } catch (err) {
      setProfile({ ...MOCK_USER, id: uid });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-sans">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm opacity-50 uppercase tracking-tighter">Carregando</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Auth onSuccess={() => {}} />;
  }

  const role = profile?.role || 'MORADOR';

  return (
    <Layout 
      user={profile || MOCK_USER} 
      condo={MOCK_CONDO}
      activeRoute={currentRoute}
      onNavigate={(r) => setCurrentRoute(r as ModuleId)}
      onLogout={() => supabase.auth.signOut()}
    >
      <div className="animate-in fade-in duration-300">
        {currentRoute === 'dashboard' && <Dashboard data={MOCK_SUMMARY} userRole={role} />}
        {currentRoute === 'transactions' && <Transactions transactions={MOCK_TRANSACTIONS} />}
        {currentRoute === 'billings' && <Billings billings={MOCK_BILLINGS} userRole={role} />}
        {currentRoute === 'units' && <Units initialUnits={MOCK_UNITS} />}
        {currentRoute === 'suppliers' && <Suppliers initialSuppliers={MOCK_SUPPLIERS} />}
        {currentRoute === 'maintenance' && <Maintenance initialTasks={MOCK_MAINTENANCE} suppliers={MOCK_SUPPLIERS} />}
        {currentRoute === 'reports' && <Reports />}
        {currentRoute === 'settings' && <Settings condo={MOCK_CONDO} />}
      </div>
    </Layout>
  );
};

export default App;