import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Icons } from './ui/Icons';
import { Button } from './ui/Button';
import { 
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend, Area
} from 'recharts';
import { FinancialSummary, UserRole } from '../types';
import { MOCK_TRANSACTIONS } from '../constants';

interface DashboardProps {
  data: FinancialSummary;
  userRole?: UserRole;
}

const formatCurrency = (value: number) => 
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export const Dashboard: React.FC<DashboardProps> = ({ data, userRole = 'ADMIN_CONDOMINIO' }) => {
  
  // If user is MORADOR, show restricted view
  if (userRole === 'MORADOR') {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Olá, Vizinho!</h2>
                    <p className="text-slate-500">Bem-vindo ao portal do seu condomínio.</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                 <Card className="bg-blue-50 border-blue-100">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-blue-800 text-base flex items-center gap-2">
                            <Icons.Wallet className="h-5 w-5" />
                            Minha Próxima Fatura
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900 mt-2">R$ 850,00</div>
                        <p className="text-sm text-slate-600 mt-1">Vence em 10/11/2023</p>
                        <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
                            Copiar Código de Barras
                        </Button>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-slate-700 text-base flex items-center gap-2">
                            <Icons.Bell className="h-5 w-5" />
                            Comunicados Recentes
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-3 mt-1 text-sm">
                            <li className="flex gap-2 items-start">
                                <span className="bg-slate-200 h-1.5 w-1.5 rounded-full mt-2 flex-shrink-0"></span>
                                <span className="text-slate-600">Manutenção do elevador social dia 25/10.</span>
                            </li>
                            <li className="flex gap-2 items-start">
                                <span className="bg-slate-200 h-1.5 w-1.5 rounded-full mt-2 flex-shrink-0"></span>
                                <span className="text-slate-600">Assembleia Geral Ordinária agendada para 15/11.</span>
                            </li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
  }

  // STANDARD ADMIN DASHBOARD
  const chartData = data.history.map(item => ({
    ...item,
    balance: item.revenue - item.expenses
  }));

  const recentTransactions = MOCK_TRANSACTIONS.slice(0, 5);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Visão Geral</h2>
          <p className="text-slate-500">Resumo financeiro e operacional de Outubro/2023</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
                <Icons.Download className="h-4 w-4" /> Relatório Rápido
            </Button>
            {userRole !== 'CONSELHO' && (
                <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                    <Icons.Plus className="h-4 w-4" /> Nova Solicitação
                </Button>
            )}
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <span className="text-sm font-medium text-slate-500">Receita Total</span>
              <div className="p-2 bg-emerald-50 rounded-full">
                <Icons.ArrowUpRight className="h-4 w-4 text-emerald-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2">{formatCurrency(data.revenue)}</div>
            <div className="flex items-center mt-1 text-xs">
                <Icons.TrendingUp className="h-3 w-3 text-emerald-500 mr-1" />
                <span className="text-emerald-600 font-medium">+2.5%</span>
                <span className="text-slate-400 ml-1">vs mês anterior</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <span className="text-sm font-medium text-slate-500">Despesas</span>
              <div className="p-2 bg-red-50 rounded-full">
                <Icons.ArrowDownLeft className="h-4 w-4 text-red-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2">{formatCurrency(data.expenses)}</div>
            <div className="flex items-center mt-1 text-xs">
                <span className="text-slate-500 font-medium">Dentro do previsto</span>
                <span className="text-slate-400 ml-1">(92% do orçamento)</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <span className="text-sm font-medium text-slate-500">Saldo em Caixa</span>
              <div className="p-2 bg-blue-50 rounded-full">
                <Icons.Wallet className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2">{formatCurrency(data.balance)}</div>
            <div className="flex items-center mt-1 text-xs">
                 <span className="text-slate-500">Fundo Reserva:</span>
                 <span className="text-slate-900 font-medium ml-1">R$ 12.000,00</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <span className="text-sm font-medium text-slate-500">Inadimplência</span>
              <div className="p-2 bg-amber-50 rounded-full">
                <Icons.AlertCircle className="h-4 w-4 text-amber-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 mt-2">{data.delinquencyRate}%</div>
            <div className="flex items-center mt-1 text-xs">
                <span className="text-amber-600 font-medium">3 unidades</span>
                <span className="text-slate-400 ml-1">em atraso &gt; 30 dias</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-7">
        
        {/* Main Chart */}
        <Card className="col-span-7 lg:col-span-5">
          <CardHeader>
            <div className="flex items-center justify-between">
                <CardTitle>Fluxo de Caixa & Resultado</CardTitle>
                <select className="text-xs border-none bg-slate-100 rounded-md px-2 py-1 text-slate-600 cursor-pointer focus:ring-0">
                    <option>Últimos 6 meses</option>
                    <option>Este Ano</option>
                </select>
            </div>
          </CardHeader>
          <CardContent className="pl-0">
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#94a3b8" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    dy={10}
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `R$${value/1000}k`} 
                  />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number, name: string) => [
                        formatCurrency(value), 
                        name === 'revenue' ? 'Receitas' : name === 'expenses' ? 'Despesas' : 'Saldo'
                    ]}
                  />
                  <Legend iconType="circle" />
                  <Bar dataKey="revenue" name="Receitas" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar dataKey="expenses" name="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
                  <Area type="monotone" dataKey="balance" name="Saldo" stroke="#3b82f6" fillOpacity={1} fill="url(#colorBalance)" strokeWidth={3} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Side Panel: Alerts & Quick Actions */}
        <div className="col-span-7 lg:col-span-2 space-y-6">
            {/* Alerts */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Icons.Bell className="h-4 w-4 text-amber-500" />
                        Alertas & Pendências
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-slate-100">
                        <div className="p-4 hover:bg-slate-50 transition flex items-start gap-3">
                            <div className="h-2 w-2 mt-2 rounded-full bg-red-500 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-slate-800">Conta de Energia Vencendo</p>
                                <p className="text-xs text-slate-500">Vence hoje (20/10) - R$ 1.200,50</p>
                            </div>
                        </div>
                        <div className="p-4 hover:bg-slate-50 transition flex items-start gap-3">
                            <div className="h-2 w-2 mt-2 rounded-full bg-amber-500 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-slate-800">Manutenção Elevador</p>
                                <p className="text-xs text-slate-500">Agendada para 25/10</p>
                            </div>
                        </div>
                        <div className="p-4 hover:bg-slate-50 transition flex items-start gap-3">
                            <div className="h-2 w-2 mt-2 rounded-full bg-blue-500 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-slate-800">Contrato Seguro</p>
                                <p className="text-xs text-slate-500">Renovação em 30 dias</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Acesso Rápido</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3">
                    {userRole !== 'CONSELHO' && (
                        <button className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition text-slate-600">
                            <Icons.FileText className="h-5 w-5 mb-2 text-blue-600" />
                            <span className="text-xs font-medium">Lançar Despesa</span>
                        </button>
                    )}
                    {userRole !== 'CONSELHO' && (
                        <button className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition text-slate-600">
                            <Icons.Users className="h-5 w-5 mb-2 text-emerald-600" />
                            <span className="text-xs font-medium">Gerar Boletos</span>
                        </button>
                    )}
                    <button className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition text-slate-600">
                        <Icons.CreditCard className="h-5 w-5 mb-2 text-purple-600" />
                        <span className="text-xs font-medium">2ª Via</span>
                    </button>
                    {userRole === 'ADMIN_CONDOMINIO' && (
                        <button className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition text-slate-600">
                            <Icons.Settings className="h-5 w-5 mb-2 text-slate-600" />
                            <span className="text-xs font-medium">Configurar</span>
                        </button>
                    )}
                </CardContent>
            </Card>
        </div>

        {/* Recent Transactions List */}
        <Card className="col-span-7">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Icons.Activity className="h-4 w-4 text-slate-500" />
                        Últimas Movimentações
                    </CardTitle>
                    <Button variant="ghost" size="sm" className="text-xs h-8">Ver Todas</Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50/50">
                            <tr>
                                <th className="px-4 py-2 font-medium">Descrição</th>
                                <th className="px-4 py-2 font-medium">Categoria</th>
                                <th className="px-4 py-2 font-medium">Data</th>
                                <th className="px-4 py-2 font-medium">Status</th>
                                <th className="px-4 py-2 font-medium text-right">Valor</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {recentTransactions.map((t) => (
                                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-3 font-medium text-slate-900 flex items-center gap-2">
                                        <div className={`w-1.5 h-1.5 rounded-full ${t.type === 'RECEITA' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                        {t.description}
                                    </td>
                                    <td className="px-4 py-3 text-slate-500">{t.category}</td>
                                    <td className="px-4 py-3 text-slate-500">{new Date(t.dueDate).toLocaleDateString('pt-BR')}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium 
                                            ${t.status === 'PAGO' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20' : 
                                              t.status === 'PENDENTE_APROVACAO' ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20' : 
                                              'bg-slate-50 text-slate-600 ring-1 ring-slate-600/20'}`}>
                                            {t.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className={`px-4 py-3 text-right font-semibold ${t.type === 'RECEITA' ? 'text-emerald-600' : 'text-slate-900'}`}>
                                        {t.type === 'DESPESA' && '- '}{formatCurrency(t.amount)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
};