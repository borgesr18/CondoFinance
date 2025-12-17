
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Icons } from './ui/Icons';

interface AuthProps {
  onSuccess: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
        setError("O sistema de autenticação não está configurado. Verifique as configurações.");
        return;
    }
    
    setLoading(true);
    setError(null);

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              full_name: email.split('@')[0],
            }
          }
        });
        if (error) throw error;
        alert('Cadastro realizado com sucesso! Você já pode entrar.');
        setMode('login');
        setLoading(false);
        return;
      }
      onSuccess();
    } catch (err: any) {
      let message = err.message;
      if (message === 'Invalid login credentials') message = 'E-mail ou senha incorretos.';
      setError(message || 'Ocorreu um erro na autenticação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md space-y-8 z-10 p-4">
        <div className="text-center animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-500/20 transform hover:scale-105 transition-transform cursor-pointer">
            <Icons.Logo className="h-12 w-12 text-white" />
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight text-white mb-2">CondoFinance</h2>
          <p className="text-slate-400 text-lg">A plataforma definitiva para seu condomínio.</p>
        </div>

        <Card className="border-none shadow-3xl bg-white animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
          <CardHeader className="pt-8 pb-2">
            <CardTitle className="text-2xl text-center text-slate-900 font-bold">
              {mode === 'login' ? 'Acessar Painel' : 'Comece Grátis'}
            </CardTitle>
            <p className="text-center text-sm text-slate-500 mt-1">
              {mode === 'login' ? 'Insira suas credenciais para continuar' : 'Crie sua conta administrativa hoje'}
            </p>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl flex items-start gap-3 animate-in shake-in duration-300">
                  <Icons.AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">E-mail Corporativo</label>
                <div className="relative">
                  <Icons.Users className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-slate-900 placeholder:text-slate-300"
                    placeholder="voce@exemplo.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Sua Senha</label>
                  {mode === 'login' && (
                    <button type="button" className="text-xs text-blue-600 hover:underline">Esqueceu a senha?</button>
                  )}
                </div>
                <div className="relative">
                  <Icons.Shield className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-slate-900 placeholder:text-slate-300"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full py-7 text-lg bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98]" 
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Autenticando...</span>
                  </div>
                ) : mode === 'login' ? 'Entrar Agora' : 'Criar Conta Gratuita'}
              </Button>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-slate-400 font-medium tracking-widest">OU</span>
                </div>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                  className="text-sm text-slate-600 hover:text-blue-600 font-semibold transition-colors"
                >
                  {mode === 'login' ? 'Novo por aqui? Crie sua conta' : 'Já tem uma conta? Faça login'}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="flex justify-center gap-6 text-slate-500 text-xs font-medium">
          <a href="#" className="hover:text-white transition-colors">Suporte</a>
          <a href="#" className="hover:text-white transition-colors">Termos</a>
          <a href="#" className="hover:text-white transition-colors">Segurança</a>
        </div>
      </div>
    </div>
  );
};
