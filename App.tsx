
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
    // TIMER DE SEGURANÇA MÁXIMA: 
    // Se em 1.5 segundos nada acontecer, paramos o loading de qualquer jeito.
    const timer = setTimeout(() => {
      console.log("App: Timeout de segurança atingido.");
      setIsLoading(false);
    }, 1500);

    const checkAuth = async () => {
      try {
        if (!isSupabaseConfigured || !supabase) {
          setIsLoading(false);
          return;
        }

        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        setSession(initialSession);
        if (initialSession) {
          await loadProfile(initialSession.user.id);
        }
      } catch (err) {
        console.error("App: Erro ao carregar sessão:", err);
      } finally {
        setIsLoading(false);
        clearTimeout(timer);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession) {
        loadProfile(newSession.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const loadProfile = async (userId: string) => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('perfis')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (data) {
        setProfile({
          id: data.id,
          name: data.nome || 'Usuário',
          email: data.email,
          role: (data.role as UserRole) || 'MORADOR',
          avatarUrl: data.avatar_url
        });
      } else {
        // Fallback imediato se o perfil não existir ainda
        setProfile({
          id: userId,
          name: session?.user?.email?.split('@')[0] || 'Novo Usuário',
          email: session?.user?.email || '',
          role: 'ADMIN_CONDOMINIO',
        });
      }
    } catch (err) {
      console.error("App: Erro ao carregar perfil:", err);
      setProfile({ ...MOCK_USER, id: userId });
    }
  };

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
  };

  // Lógica de renderização direta para evitar hoisting
  const renderView = () => {
    const role = profile?.role || 'MORADOR';
    
    if (!canAccess(role, currentRoute)) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center">
                <h2 className="text-xl font-bold text-slate-800">Acesso Restrito</h2>
                <p className="text-slate-500">Você não tem permissão para ver este módulo.</p>
                <button onClick={() => setCurrentRoute('dashboard')} className="mt-4 text-blue-600 font-medium">Voltar ao Início</button>
            </div>
        );
    }

    switch (currentRoute) {
      case 'dashboard': return <Dashboard data={MOCK_SUMMARY} userRole={role} />;
      case 'transactions': return <Transactions transactions={MOCK_TRANSACTIONS} />;
      case 'billings': return <Billings billings={MOCK_BILLINGS} userRole={role} />;
      case 'units': return <Units initialUnits={MOCK_UNITS} />;
      case 'suppliers': return <Suppliers initialSuppliers={MOCK_SUPPLIERS} />;
      case 'maintenance': return <Maintenance initialTasks={MOCK_MAINTENANCE} suppliers={MOCK_SUPPLIERS} />;
      case 'reports': return <Reports />;
      case 'settings': return <Settings condo={MOCK_CONDO} />;
      default: return <Dashboard data={MOCK_SUMMARY} userRole={role} />;
    }
  };

  // TELA DE CARREGAMENTO
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white">
        <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="mt-4 font-bold tracking-widest text-sm opacity-50 uppercase">CondoFinance</p>
      </div>
    );
  }

  // TELA DE LOGIN (Se não houver sessão)
  if (!session) {
    return <Auth onSuccess={() => {}} />;
  }

  // APP PRINCIPAL
  return (
    <Layout 
        user={profile || MOCK_USER} 
        condo={MOCK_CONDO}
        activeRoute={currentRoute}
        onNavigate={(r) => setCurrentRoute(r as ModuleId)}
        onLogout={handleLogout}
    >
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        {renderView()}
      </div>
    </Layout>
  );
};

export default App;
