import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Icons } from './ui/Icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';

// --- MOCK DATA FOR REPORTS ---
const MOCK_MONTHLY_DETAILS = {
  revenues: [
    { category: 'Taxa Condominial', amount: 22500.00, count: 25 },
    { category: 'Fundo de Reserva', amount: 2250.00, count: 25 },
    { category: 'Taxa Extra (Obras)', amount: 5000.00, count: 20 },
    { category: 'Aluguel Salão Festas', amount: 450.00, count: 2 },
    { category: 'Multas e Juros', amount: 125.50, count: 3 },
  ],
  expenses: [
    { category: 'Folha de Pagamento', amount: 8500.00, provider: 'Funcionários Próprios' },
    { category: 'Energia Elétrica', amount: 2100.45, provider: 'Enel' },
    { category: 'Água e Esgoto', amount: 3450.10, provider: 'Sabesp' },
    { category: 'Manutenção Elevadores', amount: 850.00, provider: 'Atlas Schindler' },
    { category: 'Jardinagem', amount: 600.00, provider: 'Verde Vida' },
    { category: 'Material de Limpeza', amount: 350.20, provider: 'Limpa Tudo Ltda' },
    { category: 'Segurança/Monitoramento', amount: 1200.00, provider: 'SegurMax' },
    { category: 'Taxa Administrativa', amount: 1100.00, provider: 'Adm Condomínios' },
  ],
  prevBalance: 5100.00
};

const MOCK_HISTORY_CHART = [
  { month: 'Jan', revenue: 21000, expenses: 18000 },
  { month: 'Fev', revenue: 20500, expenses: 19000 },
  { month: 'Mar', revenue: 22000, expenses: 17500 },
  { month: 'Abr', revenue: 21500, expenses: 22000 },
  { month: 'Mai', revenue: 23000, expenses: 18500 },
  { month: 'Jun', revenue: 22500, expenses: 19000 },
  { month: 'Jul', revenue: 24000, expenses: 18000 },
  { month: 'Ago', revenue: 23500, expenses: 20000 },
  { month: 'Set', revenue: 24500, expenses: 19500 },
  { month: 'Out', revenue: 25000, expenses: 18000 },
  { month: 'Nov', revenue: 30325.50, expenses: 18150.75 }, // Current month sim
  { month: 'Dez', revenue: 0, expenses: 0 },
];

const MOCK_EXPENSE_PIE = [
  { name: 'Pessoal/Folha', value: 8500, color: '#ef4444' }, // Red
  { name: 'Consumo (Água/Luz)', value: 5550, color: '#f59e0b' }, // Amber
  { name: 'Manutenção', value: 1450, color: '#3b82f6' }, // Blue
  { name: 'Administrativo', value: 1100, color: '#64748b' }, // Slate
  { name: 'Serviços Terceiros', value: 1200, color: '#10b981' }, // Emerald
  { name: 'Materiais', value: 350, color: '#8b5cf6' }, // Purple
];

const MOCK_DELINQUENCY = [
  { unit: 'APT 102', owner: 'João da Silva', months: 2, amount: 1850.00, status: 'Em Cobrança' },
  { unit: 'APT 304', owner: 'Maria Oliveira', months: 1, amount: 850.00, status: 'Atrasado' },
  { unit: 'APT 501', owner: 'Investimentos Ltda', months: 5, amount: 4500.00, status: 'Jurídico' },
];

const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

export const Reports: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState('11');
  const [selectedYear, setSelectedYear] = useState('2023');
  const [view, setView] = useState<'STATEMENT' | 'CHARTS' | 'DELINQUENCY'>('STATEMENT');

  // Calculations for Statement
  const totalRevenue = MOCK_MONTHLY_DETAILS.revenues.reduce((acc, r) => acc + r.amount, 0);
  const totalExpense = MOCK_MONTHLY_DETAILS.expenses.reduce((acc, e) => acc + e.amount, 0);
  const result = totalRevenue - totalExpense;
  const finalBalance = MOCK_MONTHLY_DETAILS.prevBalance + result;

  const handleExport = (type: 'PDF' | 'EXCEL') => {
    alert(`Exportando relatório ${type} de ${selectedMonth}/${selectedYear}... (Simulado)`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Relatórios & Prestação de Contas</h2>
          <p className="text-slate-500">Transparência financeira e análise de resultados.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
            <select 
                className="h-9 rounded-md border border-slate-200 bg-slate-50 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
            >
                <option value="01">Janeiro</option>
                <option value="02">Fevereiro</option>
                <option value="03">Março</option>
                <option value="04">Abril</option>
                <option value="05">Maio</option>
                <option value="06">Junho</option>
                <option value="07">Julho</option>
                <option value="08">Agosto</option>
                <option value="09">Setembro</option>
                <option value="10">Outubro</option>
                <option value="11">Novembro</option>
                <option value="12">Dezembro</option>
            </select>
            <select 
                className="h-9 rounded-md border border-slate-200 bg-slate-50 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
            >
                <option value="2023">2023</option>
                <option value="2024">2024</option>
            </select>
            <div className="w-px bg-slate-200 hidden sm:block"></div>
            <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => handleExport('PDF')} title="Imprimir / PDF">
                    <Icons.Printer className="h-4 w-4 text-slate-600" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleExport('EXCEL')} title="Exportar Excel">
                    <Icons.Sheet className="h-4 w-4 text-emerald-600" />
                </Button>
            </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 rounded-xl bg-slate-100 p-1 w-full md:w-fit">
        <button
            onClick={() => setView('STATEMENT')}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium leading-5 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2 ${
                view === 'STATEMENT' 
                ? 'bg-white text-blue-700 shadow' 
                : 'text-slate-500 hover:bg-white/[0.12] hover:text-slate-700'
            }`}
        >
            <Icons.FileText className="h-4 w-4" />
            Demonstrativo
        </button>
        <button
            onClick={() => setView('CHARTS')}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium leading-5 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2 ${
                view === 'CHARTS' 
                ? 'bg-white text-blue-700 shadow' 
                : 'text-slate-500 hover:bg-white/[0.12] hover:text-slate-700'
            }`}
        >
            <Icons.PieChart className="h-4 w-4" />
            Gráficos
        </button>
        <button
            onClick={() => setView('DELINQUENCY')}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium leading-5 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2 ${
                view === 'DELINQUENCY' 
                ? 'bg-white text-blue-700 shadow' 
                : 'text-slate-500 hover:bg-white/[0.12] hover:text-slate-700'
            }`}
        >
            <Icons.AlertCircle className="h-4 w-4" />
            Inadimplência
        </button>
      </div>

      {/* --- VIEW: STATEMENT (Demonstrativo) --- */}
      {view === 'STATEMENT' && (
        <Card className="overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-200">
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Demonstrativo Mensal</CardTitle>
                        <p className="text-sm text-slate-500 mt-1">Período: 01/{selectedMonth}/{selectedYear} a 30/{selectedMonth}/{selectedYear}</p>
                    </div>
                    <div className="text-right hidden sm:block">
                        <p className="text-xs text-slate-400 uppercase font-semibold">Saldo Atual (Caixa)</p>
                        <p className="text-2xl font-bold text-slate-900">{formatCurrency(finalBalance)}</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
                <div className="divide-y divide-slate-100 min-w-[600px]">
                    
                    {/* Previous Balance Row */}
                    <div className="flex items-center justify-between px-6 py-4 bg-slate-50/50">
                        <span className="font-semibold text-slate-600">Saldo Anterior (Mês Passado)</span>
                        <span className="font-mono font-medium text-slate-600">{formatCurrency(MOCK_MONTHLY_DETAILS.prevBalance)}</span>
                    </div>

                    {/* Revenue Section */}
                    <div className="bg-emerald-50/30 px-6 py-3 border-l-4 border-emerald-500">
                        <h4 className="text-sm font-bold text-emerald-800 uppercase tracking-wide">Receitas</h4>
                    </div>
                    {MOCK_MONTHLY_DETAILS.revenues.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between px-6 py-3 hover:bg-slate-50 text-sm">
                            <div className="flex flex-col">
                                <span className="font-medium text-slate-700">{item.category}</span>
                                <span className="text-xs text-slate-400">{item.count} lançamentos</span>
                            </div>
                            <span className="text-emerald-600 font-medium">{formatCurrency(item.amount)}</span>
                        </div>
                    ))}
                    <div className="flex items-center justify-between px-6 py-3 bg-emerald-50/50 font-bold border-t border-emerald-100">
                        <span className="text-emerald-800">Total Receitas</span>
                        <span className="text-emerald-700">{formatCurrency(totalRevenue)}</span>
                    </div>

                    {/* Expenses Section */}
                    <div className="bg-red-50/30 px-6 py-3 border-l-4 border-red-500 mt-4">
                        <h4 className="text-sm font-bold text-red-800 uppercase tracking-wide">Despesas</h4>
                    </div>
                    {MOCK_MONTHLY_DETAILS.expenses.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between px-6 py-3 hover:bg-slate-50 text-sm">
                            <div className="flex flex-col">
                                <span className="font-medium text-slate-700">{item.category}</span>
                                <span className="text-xs text-slate-400">{item.provider}</span>
                            </div>
                            <span className="text-red-600 font-medium">- {formatCurrency(item.amount)}</span>
                        </div>
                    ))}
                    <div className="flex items-center justify-between px-6 py-3 bg-red-50/50 font-bold border-t border-red-100">
                        <span className="text-red-800">Total Despesas</span>
                        <span className="text-red-700">- {formatCurrency(totalExpense)}</span>
                    </div>

                    {/* Summary Footer */}
                    <div className="px-6 py-6 bg-slate-100 border-t border-slate-200 mt-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-slate-600">Resultado do Mês (Superávit/Déficit)</span>
                            <span className={`font-bold ${result >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                {formatCurrency(result)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-slate-300">
                            <span className="text-lg font-bold text-slate-800">Saldo Final em Caixa</span>
                            <span className="text-lg font-bold text-blue-700">{formatCurrency(finalBalance)}</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
      )}

      {/* --- VIEW: CHARTS --- */}
      {view === 'CHARTS' && (
        <div className="grid gap-6 md:grid-cols-2">
            <Card className="col-span-2">
                <CardHeader>
                    <CardTitle>Fluxo de Caixa (Últimos 12 Meses)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={MOCK_HISTORY_CHART} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `R$${val/1000}k`} />
                                <Tooltip 
                                    cursor={{fill: '#f1f5f9'}}
                                    formatter={(value: number) => formatCurrency(value)}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend />
                                <Bar dataKey="revenue" name="Receitas" fill="#10b981" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="expenses" name="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Despesas por Categoria</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={MOCK_EXPENSE_PIE}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {MOCK_EXPENSE_PIE.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                                <Legend layout="vertical" verticalAlign="middle" align="right" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Resumo Anual</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-100 rounded-full"><Icons.ArrowUpRight className="h-4 w-4 text-emerald-600"/></div>
                            <span className="text-sm font-medium text-slate-700">Total Arrecadado</span>
                        </div>
                        <span className="font-bold text-emerald-700">{formatCurrency(287825.50)}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-100 rounded-full"><Icons.ArrowDownLeft className="h-4 w-4 text-red-600"/></div>
                            <span className="text-sm font-medium text-slate-700">Total Gasto</span>
                        </div>
                        <span className="font-bold text-red-700">{formatCurrency(227150.75)}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                         <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-full"><Icons.Wallet className="h-4 w-4 text-blue-600"/></div>
                            <span className="text-sm font-medium text-slate-700">Economia Gerada</span>
                        </div>
                        <span className="font-bold text-blue-700">{formatCurrency(60674.75)}</span>
                    </div>
                </CardContent>
            </Card>
        </div>
      )}

      {/* --- VIEW: DELINQUENCY --- */}
      {view === 'DELINQUENCY' && (
        <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-red-50 border-red-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-red-800 text-sm">Total Inadimplência</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-900">{formatCurrency(7200.00)}</div>
                        <p className="text-xs text-red-600 mt-1">Refere-se a 3 unidades</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Unidades em Atraso</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left min-w-[600px]">
                            <thead className="bg-slate-50 text-slate-500 font-medium">
                                <tr>
                                    <th className="px-4 py-3">Unidade</th>
                                    <th className="px-4 py-3">Proprietário</th>
                                    <th className="px-4 py-3">Meses em Atraso</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3 text-right">Valor Total</th>
                                    <th className="px-4 py-3 text-center">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {MOCK_DELINQUENCY.map((d, i) => (
                                    <tr key={i} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 font-bold text-slate-900">{d.unit}</td>
                                        <td className="px-4 py-3 text-slate-600">{d.owner}</td>
                                        <td className="px-4 py-3">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                                {d.months} meses
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600">{d.status}</td>
                                        <td className="px-4 py-3 text-right font-bold text-slate-900">{formatCurrency(d.amount)}</td>
                                        <td className="px-4 py-3 text-center">
                                            <Button variant="outline" size="sm" className="h-7 text-xs">Detalhes</Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
      )}
    </div>
  );
};