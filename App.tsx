
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
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/Card';
import { Icons } from './components/ui/Icons';
import { MOCK_USER, MOCK_CONDO, MOCK_SUMMARY, MOCK_TRANSACTIONS, MOCK_BILLINGS, MOCK_UNITS, MOCK_SUPPLIERS, MOCK_MAINTENANCE } from './constants';
import { canAccess, ModuleId } from './utils/permissions';
import { User, UserRole } from './types';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [currentRoute, setCurrentRoute] = useState<ModuleId>('dashboard');
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured);

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
      const { data, error } = await supabase
        .from('membros')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        const fallbackProfile: User = {
          id: userId,
          name: session?.user?.user_metadata?.full_name || 'Usuário Novo',
          email: session?.user?.email || '',
          role: 'ADMIN_CONDOMINIO',
          avatarUrl: session?.user?.user_metadata?.avatar_url
        };
        setProfile(fallbackProfile);
      } else {
        setProfile({
          id: data.id,
          name: data.nome,
          email: data.email,
          role: data.role as UserRole,
          avatarUrl: data.avatar_url
        });
      }
    } catch (err) {
      console.error("Erro ao carregar perfil:", err);
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
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <Icons.Shield className="h-6 w-6 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">Acesso Negado</h2>
                <p className="text-slate-500 mt-2">Seu perfil ({profile.role}) não tem permissão para este módulo.</p>
                <Button className="mt-4" onClick={() => setCurrentRoute('dashboard')}>Voltar ao Dashboard</Button>
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

  // UI para quando o Supabase não está configurado
  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <Card className="max-w-md w-full border-t-4 border-t-blue-600 shadow-xl">
          <CardHeader>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
              <Icons.Logo className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">Configuração Necessária</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-600 text-sm">
              O sistema CondoFinance exige a configuração do <strong>Supabase</strong> para funcionar em modo de produção.
            </p>
            <div className="bg-slate-900 rounded-md p-4 text-xs font-mono text-slate-300 space-y-2">
              <p>NEXT_PUBLIC_SUPABASE_URL=seu_projeto.supabase.co</p>
              <p>NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima</p>
            </div>
            <p className="text-slate-500 text-xs italic">
              Por favor, configure as chaves acima nas suas variáveis de ambiente ou configurações do projeto.
            </p>
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white" 
              onClick={() => window.location.reload()}
            >
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600 font-medium">Conectando ao CondoFinance...</p>
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
      {renderContent()}
    </Layout>
  );
};

export default App;
