
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
import { Button } from './components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Icons } from './components/ui/Icons';
import { MOCK_USER, MOCK_CONDO, MOCK_SUMMARY, MOCK_TRANSACTIONS, MOCK_BILLINGS, MOCK_UNITS, MOCK_SUPPLIERS, MOCK_MAINTENANCE } from './constants';
import { canAccess, ModuleId } from './utils/permissions';
import { User, UserRole } from './types';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [currentRoute, setCurrentRoute] = useState<ModuleId>('dashboard');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setIsLoading(false);
      return;
    }

    // 1. Checar sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setIsLoading(false);
    });

    // 2. Ouvir mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else {
        setProfile(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    if (!supabase) return;
    setIsLoading(true);
    try {
      // Tenta buscar o perfil na tabela de membros
      const { data, error } = await supabase
        .from('membros')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error || !data) {
        // Se a tabela ainda não existir ou o usuário não tiver perfil, cria um temporário
        const fallbackProfile: User = {
          id: userId,
          name: session?.user?.user_metadata?.full_name || session?.user?.email?.split('@')[0] || 'Usuário',
          email: session?.user?.email || '',
          role: 'ADMIN_CONDOMINIO', // Novo usuário é Admin por padrão no setup
          avatarUrl: `https://ui-avatars.com/api/?name=${session?.user?.email}&background=0D8ABC&color=fff`
        };
        setProfile(fallbackProfile);
      } else {
        setProfile({
          id: data.id,
          name: data.nome,
          email: data.email,
          role: data.role as UserRole,
          avatarUrl: data.avatar_url || `https://ui-avatars.com/api/?name=${data.nome}&background=0D8ABC&color=fff`
        });
      }
    } catch (err) {
      console.error("Erro ao carregar perfil:", err);
      // Fallback seguro em caso de erro de banco
      setProfile(MOCK_USER);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
  };

  const renderContent = () => {
    if (!profile) return null;

    if (!canAccess(profile.role, currentRoute)) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 animate-in zoom-in duration-300">
                <div className="h-16 w-16 bg-red-100 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                    <Icons.Shield className="h-8 w-8 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Acesso Restrito</h2>
                <p className="text-slate-500 mt-2 max-w-xs">Seu perfil ({profile.role}) não possui as permissões necessárias para este módulo.</p>
                <Button className="mt-8 px-8 bg-slate-900" onClick={() => setCurrentRoute('dashboard')}>Voltar ao Dashboard</Button>
            </div>
        );
    }

    switch (currentRoute) {
      case 'dashboard':
        return <Dashboard data={MOCK_SUMMARY} userRole={profile.role} />;
      case 'transactions':
        return <Transactions transactions={MOCK_TRANSACTIONS} />;
      case 'billings':
        const displayedBillings = profile.role === 'MORADOR' 
            ? MOCK_BILLINGS.filter(b => b.unitId === 'unit-0') 
            : MOCK_BILLINGS;
        return <Billings billings={displayedBillings} userRole={profile.role} />;
      case 'units':
        return <Units initialUnits={MOCK_UNITS} />;
      case 'suppliers':
        return <Suppliers initialSuppliers={MOCK_SUPPLIERS} />;
      case 'maintenance':
        return <Maintenance initialTasks={MOCK_MAINTENANCE} suppliers={MOCK_SUPPLIERS} />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings condo={MOCK_CONDO} />;
      default:
        return <div>Página não encontrada</div>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-6 text-slate-900 font-bold text-lg">CondoFinance</p>
          <p className="text-slate-500 text-sm">Autenticando sua sessão com segurança...</p>
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
        onLogout={handleLogout}
    >
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
        {renderContent()}
      </div>
    </Layout>
  );
};

export default App;
