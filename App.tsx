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
    // TIMER DE SEGURANÇA: Se em 2.5 segundos o Supabase não responder,
    // interrompemos o loading para mostrar a tela de login ou erro.
    const safetyTimer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);

    const initAuth = async () => {
      if (!isSupabaseConfigured || !supabase) {
        setIsLoading(false);
        return;
      }

      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
        if (initialSession) {
          await fetchProfile(initialSession.user.id);
        }
      } catch (err) {
        console.error("Erro na inicialização:", err);
      } finally {
        setIsLoading(false);
        clearTimeout(safetyTimer);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession) {
        fetchProfile(newSession.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(safetyTimer);
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase
        .from('perfis')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile({
          id: data.id,
          name: data.nome || 'Usuário',
          email: data.email,
          role: (data.role as UserRole) || 'MORADOR',
          avatarUrl: data.avatar_url
        });
      } else {
        // Fallback: Perfil ainda não criado no banco
        setProfile({
          id: userId,
          name: session?.user?.email?.split('@')[0] || 'Usuário',
          email: session?.user?.email || '',
          role: 'ADMIN_CONDOMINIO',
        });
      }
    } catch (err) {
      console.error("Erro ao buscar perfil:", err);
      setProfile({ ...MOCK_USER, id: userId });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-slate-400 font-medium animate-pulse">Iniciando CondoFinance...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Auth onSuccess={() => {}} />;
  }

  return (
    <Layout 
        user={profile || MOCK_USER} 
        condo={MOCK_CONDO}
        activeRoute={currentRoute}
        onNavigate={(r) => setCurrentRoute(r as ModuleId)}
        onLogout={() => supabase.auth.signOut()}
    >
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
        {renderContent()}
      </div>
    </Layout>
  );

  function renderContent() {
    if (!profile) return null;
    if (!canAccess(profile.role, currentRoute)) return <div className="p-8 text-center">Acesso Negado</div>;

    switch (currentRoute) {
      case 'dashboard': return <Dashboard data={MOCK_SUMMARY} userRole={profile.role} />;
      case 'transactions': return <Transactions transactions={MOCK_TRANSACTIONS} />;
      case 'billings': return <Billings billings={MOCK_BILLINGS} userRole={profile.role} />;
      case 'units': return <Units initialUnits={MOCK_UNITS} />;
      case 'suppliers': return <Suppliers initialSuppliers={MOCK_SUPPLIERS} />;
      case 'maintenance': return <Maintenance initialTasks={MOCK_MAINTENANCE} suppliers={MOCK_SUPPLIERS} />;
      case 'reports': return <Reports />;
      case 'settings': return <Settings condo={MOCK_CONDO} />;
      default: return <div>Página não encontrada</div>;
    }
  }
};

export default App;