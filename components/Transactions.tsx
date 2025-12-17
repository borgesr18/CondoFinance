import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Icons } from './ui/Icons';
import { Modal } from './ui/Modal';
import { Transaction, TransactionType, TransactionStatus } from '../types';

interface TransactionsProps {
  transactions: Transaction[];
}

export const Transactions: React.FC<TransactionsProps> = ({ transactions: initialTransactions }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [filterType, setFilterType] = useState<'ALL' | 'RECEITA' | 'DESPESA'>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  
  // Default Form State
  const defaultFormData: Partial<Transaction> = {
    type: 'DESPESA',
    description: '',
    category: '',
    amount: 0,
    competenceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date().toISOString().split('T')[0],
    status: 'RASCUNHO',
    condoId: 'c1',
  };

  const [formData, setFormData] = useState<Partial<Transaction>>(defaultFormData);

  // Constants for dropdowns
  const categories = {
    RECEITA: ['Taxa Condominial', 'Taxa Extra', 'Multas', 'Aluguel Espaço', 'Outros'],
    DESPESA: ['Água', 'Energia', 'Manutenção', 'Limpeza', 'Segurança', 'Jardinagem', 'Administrativo', 'Obras', 'Outros']
  };

  const statuses: TransactionStatus[] = ['RASCUNHO', 'PENDENTE_APROVACAO', 'APROVADO', 'PAGO', 'CANCELADO'];

  // Filtering Logic
  const filtered = transactions.filter(t => {
    const matchesType = filterType === 'ALL' || t.type === filterType;
    const matchesStatus = filterStatus === 'ALL' || t.status === filterStatus;
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'PAGO': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'APROVADO': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'PENDENTE_APROVACAO': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'RASCUNHO': return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'CANCELADO': return 'bg-red-50 text-red-700 border-red-100 opacity-60';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  // CRUD Actions
  const handleOpenModal = (t?: Transaction) => {
    if (t) {
      setEditingTransaction(t);
      setFormData(t);
    } else {
      setEditingTransaction(null);
      setFormData(defaultFormData);
    }
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este lançamento?')) {
        setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingTransaction) {
        // Update
        setTransactions(prev => prev.map(t => t.id === editingTransaction.id ? { ...t, ...formData } as Transaction : t));
    } else {
        // Create
        const newTransaction: Transaction = {
            ...formData,
            id: `t-${Date.now()}`,
        } as Transaction;
        setTransactions(prev => [newTransaction, ...prev]);
    }
    setIsModalOpen(false);
  };

  const quickActionPay = (t: Transaction) => {
    setTransactions(prev => prev.map(item => 
        item.id === t.id 
        ? { ...item, status: 'PAGO', paymentDate: new Date().toISOString().split('T')[0] } 
        : item
    ));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Lançamentos</h2>
          <p className="text-slate-500">Gerencie receitas e despesas do condomínio.</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
                <Icons.Download className="h-4 w-4" /> Exportar
            </Button>
            <Button className="gap-2" onClick={() => handleOpenModal()}>
                <Icons.Plus className="h-4 w-4" /> Novo Lançamento
            </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <Button variant={filterType === 'ALL' ? 'default' : 'outline'} size="sm" onClick={() => setFilterType('ALL')}>Todos</Button>
                <Button variant={filterType === 'RECEITA' ? 'default' : 'outline'} size="sm" onClick={() => setFilterType('RECEITA')}>Receitas</Button>
                <Button variant={filterType === 'DESPESA' ? 'default' : 'outline'} size="sm" onClick={() => setFilterType('DESPESA')}>Despesas</Button>
            </div>
            
            <div className="flex items-center gap-2">
                <div className="relative w-full max-w-xs">
                    <Icons.Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Buscar..."
                        className="flex h-9 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="relative">
                    <select 
                        className="h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 pr-8 appearance-none"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="ALL">Status: Todos</option>
                        {statuses.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                    </select>
                    <Icons.Filter className="absolute right-2 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-slate-200 overflow-x-auto">
            <table className="w-full text-sm text-left min-w-[700px]">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Descrição</th>
                  <th className="px-4 py-3">Categoria</th>
                  <th className="px-4 py-3">Datas</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Valor</th>
                  <th className="px-4 py-3 w-[100px] text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filtered.length === 0 ? (
                    <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                            Nenhum lançamento encontrado.
                        </td>
                    </tr>
                ) : (
                    filtered.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-4 py-3 font-medium text-slate-900">
                        <div className="flex items-center gap-3">
                            <div className={`p-1.5 rounded-full ${t.type === 'RECEITA' ? 'bg-emerald-100' : 'bg-red-100'}`}>
                                {t.type === 'RECEITA' ? 
                                <Icons.ArrowUpRight className="h-4 w-4 text-emerald-600" /> : 
                                <Icons.ArrowDownLeft className="h-4 w-4 text-red-600" />
                                }
                            </div>
                            <div>
                                <div className="font-semibold">{t.description}</div>
                                <div className="text-xs text-slate-400 uppercase tracking-wider">{t.type}</div>
                            </div>
                        </div>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{t.category}</td>
                        <td className="px-4 py-3 text-slate-600">
                            <div className="flex flex-col text-xs">
                                <span>Venc: {new Date(t.dueDate).toLocaleDateString('pt-BR')}</span>
                                <span className="text-slate-400">Comp: {new Date(t.competenceDate).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })}</span>
                            </div>
                        </td>
                        <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(t.status)}`}>
                            {t.status.replace('_', ' ')}
                        </span>
                        </td>
                        <td className={`px-4 py-3 text-right font-bold ${t.type === 'RECEITA' ? 'text-emerald-600' : 'text-slate-900'}`}>
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(t.amount)}
                        </td>
                        <td className="px-4 py-3 text-center">
                            <div className="flex justify-center gap-1">
                                {t.status !== 'PAGO' && t.status !== 'CANCELADO' && (
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-600 hover:bg-emerald-50" title="Marcar Pago" onClick={() => quickActionPay(t)}>
                                        <Icons.Check className="h-4 w-4" />
                                    </Button>
                                )}
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-blue-600" onClick={() => handleOpenModal(t)}>
                                    <Icons.Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-red-600" onClick={() => handleDelete(t.id)}>
                                    <Icons.Trash className="h-4 w-4" />
                                </Button>
                            </div>
                        </td>
                    </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingTransaction ? 'Editar Lançamento' : 'Novo Lançamento'}
      >
        <form onSubmit={handleSave} className="space-y-4">
            {/* Type Selector */}
            <div className="grid grid-cols-2 gap-4 p-1 bg-slate-100 rounded-lg">
                <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, type: 'RECEITA' }))}
                    className={`text-sm font-medium py-2 rounded-md transition-all ${
                        formData.type === 'RECEITA' 
                        ? 'bg-white text-emerald-600 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    Receita
                </button>
                <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, type: 'DESPESA' }))}
                    className={`text-sm font-medium py-2 rounded-md transition-all ${
                        formData.type === 'DESPESA' 
                        ? 'bg-white text-red-600 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    Despesa
                </button>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium leading-none" htmlFor="description">Descrição</label>
                <input 
                    id="description"
                    required
                    className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950" 
                    placeholder="Ex: Conta de Luz Outubro"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none" htmlFor="category">Categoria</label>
                    <select
                        id="category"
                        required
                        className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950" 
                        value={formData.category}
                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    >
                        <option value="">Selecione...</option>
                        {(formData.type === 'RECEITA' ? categories.RECEITA : categories.DESPESA).map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none" htmlFor="amount">Valor (R$)</label>
                    <input 
                        id="amount"
                        type="number"
                        step="0.01"
                        required
                        className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950" 
                        placeholder="0,00"
                        value={formData.amount}
                        onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none" htmlFor="competence">Competência</label>
                    <input 
                        id="competence"
                        type="date"
                        required
                        className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950" 
                        value={formData.competenceDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, competenceDate: e.target.value }))}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none" htmlFor="duedate">Vencimento</label>
                    <input 
                        id="duedate"
                        type="date"
                        required
                        className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950" 
                        value={formData.dueDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium leading-none" htmlFor="status">Status</label>
                <select
                    id="status"
                    required
                    className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950" 
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as TransactionStatus }))}
                >
                    {statuses.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </select>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-4">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                <Button type="submit">
                    {editingTransaction ? 'Salvar Alterações' : 'Criar Lançamento'}
                </Button>
            </div>
        </form>
      </Modal>
    </div>
  );
};