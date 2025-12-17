import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Icons } from './ui/Icons';
import { Modal } from './ui/Modal';
import { MaintenanceTask, Supplier, MaintenanceStatus, MaintenancePriority, MaintenanceType } from '../types';

interface MaintenanceProps {
  initialTasks: MaintenanceTask[];
  suppliers: Supplier[];
}

export const Maintenance: React.FC<MaintenanceProps> = ({ initialTasks, suppliers }) => {
  const [tasks, setTasks] = useState<MaintenanceTask[]>(initialTasks);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<MaintenanceTask | null>(null);

  // Form State
  const defaultFormData: Partial<MaintenanceTask> = {
    title: '',
    description: '',
    type: 'PREVENTIVE',
    status: 'PENDING',
    priority: 'MEDIUM',
    scheduledDate: new Date().toISOString().split('T')[0],
    supplierId: '',
    cost: 0
  };

  const [formData, setFormData] = useState<Partial<MaintenanceTask>>(defaultFormData);

  // Filter Logic
  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || t.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getPriorityColor = (p: MaintenancePriority) => {
    switch(p) {
        case 'CRITICAL': return 'text-red-700 bg-red-100 border-red-200';
        case 'HIGH': return 'text-orange-700 bg-orange-100 border-orange-200';
        case 'MEDIUM': return 'text-blue-700 bg-blue-100 border-blue-200';
        case 'LOW': return 'text-slate-600 bg-slate-100 border-slate-200';
        default: return 'text-slate-600';
    }
  };

  const getPriorityLabel = (p: MaintenancePriority) => {
    switch(p) {
        case 'CRITICAL': return 'Crítica';
        case 'HIGH': return 'Alta';
        case 'MEDIUM': return 'Média';
        case 'LOW': return 'Baixa';
        default: return p;
    }
  };

  const getStatusColor = (s: MaintenanceStatus) => {
    switch(s) {
        case 'COMPLETED': return 'text-emerald-700 bg-emerald-100';
        case 'IN_PROGRESS': return 'text-blue-700 bg-blue-100';
        case 'PENDING': return 'text-amber-700 bg-amber-100';
        case 'CANCELLED': return 'text-slate-500 bg-slate-100 line-through';
        default: return 'text-slate-600';
    }
  };

  const getStatusLabel = (s: MaintenanceStatus) => {
    switch(s) {
        case 'COMPLETED': return 'Concluída';
        case 'IN_PROGRESS': return 'Em Andamento';
        case 'PENDING': return 'Pendente';
        case 'CANCELLED': return 'Cancelada';
        default: return s;
    }
  };

  // Actions
  const handleOpenModal = (task?: MaintenanceTask) => {
    if (task) {
      setEditingTask(task);
      setFormData(task);
    } else {
      setEditingTask(null);
      setFormData(defaultFormData);
    }
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta manutenção?')) {
        setTasks(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    const taskData = { ...formData };
    
    // Auto-set completed date if status is changed to completed
    if (taskData.status === 'COMPLETED' && !taskData.completedDate) {
        taskData.completedDate = new Date().toISOString().split('T')[0];
    }

    if (editingTask) {
        setTasks(prev => prev.map(t => t.id === editingTask.id ? { ...t, ...taskData } as MaintenanceTask : t));
    } else {
        const newTask: MaintenanceTask = {
            ...taskData,
            id: `m-${Date.now()}`,
            condoId: 'c1'
        } as MaintenanceTask;
        setTasks(prev => [newTask, ...prev]);
    }
    setIsModalOpen(false);
  };

  const activeTasksCount = tasks.filter(t => t.status === 'PENDING' || t.status === 'IN_PROGRESS').length;
  const criticalTasksCount = tasks.filter(t => t.priority === 'CRITICAL' && t.status !== 'COMPLETED').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Gestão de Manutenção</h2>
          <p className="text-slate-500">Controle preventivo e corretivo do patrimônio.</p>
        </div>
        <Button className="gap-2" onClick={() => handleOpenModal()}>
          <Icons.Plus className="h-4 w-4" /> Nova Manutenção
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-slate-50 border-slate-200">
            <CardHeader className="pb-2">
                <CardTitle className="text-slate-600 text-sm font-medium">Manutenções Ativas</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-slate-900">{activeTasksCount}</div>
            </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-200">
            <CardHeader className="pb-2">
                <CardTitle className="text-red-700 text-sm font-medium">Críticas / Urgentes</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-red-900 flex items-center gap-2">
                    {criticalTasksCount}
                    {criticalTasksCount > 0 && <Icons.AlertCircle className="h-5 w-5 animate-pulse" />}
                </div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-slate-600 text-sm font-medium">Custo Estimado (Mês)</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-blue-700">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                        tasks.filter(t => t.status !== 'CANCELLED').reduce((acc, t) => acc + (t.cost || 0), 0)
                    )}
                </div>
            </CardContent>
        </Card>
      </div>

      {/* Main List */}
      <Card>
        <CardHeader>
            <div className="flex flex-col md:flex-row gap-4 justify-between">
                <div className="relative w-full max-w-sm">
                    <Icons.Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Buscar manutenção..."
                        className="flex h-9 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select 
                    className="h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                >
                    <option value="ALL">Status: Todos</option>
                    <option value="PENDING">Pendentes</option>
                    <option value="IN_PROGRESS">Em Andamento</option>
                    <option value="COMPLETED">Concluídas</option>
                </select>
            </div>
        </CardHeader>
        <CardContent>
            <div className="rounded-md border border-slate-200 overflow-x-auto">
                <table className="w-full text-sm text-left min-w-[700px]">
                    <thead className="bg-slate-50 text-slate-500 font-medium">
                        <tr>
                            <th className="px-4 py-3">Título / Descrição</th>
                            <th className="px-4 py-3">Tipo</th>
                            <th className="px-4 py-3">Prioridade</th>
                            <th className="px-4 py-3">Agendamento</th>
                            <th className="px-4 py-3">Fornecedor</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3 text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredTasks.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                                    Nenhuma manutenção encontrada.
                                </td>
                            </tr>
                        ) : (
                            filteredTasks.map((t) => (
                                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-slate-900">{t.title}</div>
                                        <div className="text-xs text-slate-500 truncate max-w-[200px]">{t.description}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs font-semibold px-2 py-1 rounded ${t.type === 'PREVENTIVE' ? 'bg-blue-50 text-blue-700' : 'bg-orange-50 text-orange-700'}`}>
                                            {t.type === 'PREVENTIVE' ? 'Preventiva' : 'Corretiva'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded border ${getPriorityColor(t.priority)}`}>
                                            {getPriorityLabel(t.priority)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-slate-600">
                                        {new Date(t.scheduledDate).toLocaleDateString('pt-BR')}
                                    </td>
                                    <td className="px-4 py-3 text-slate-600 text-xs">
                                        {suppliers.find(s => s.id === t.supplierId)?.name || '-'}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${getStatusColor(t.status)}`}>
                                            {getStatusLabel(t.status)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex justify-center gap-1">
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
        title={editingTask ? 'Editar Manutenção' : 'Nova Manutenção'}
      >
        <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium leading-none" htmlFor="title">Título</label>
                <input 
                    id="title"
                    required
                    className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950" 
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ex: Troca de Lâmpadas Hall"
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium leading-none" htmlFor="desc">Descrição</label>
                <textarea 
                    id="desc"
                    required
                    className="flex min-h-[60px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950" 
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none" htmlFor="type">Tipo</label>
                    <select
                        id="type"
                        className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950" 
                        value={formData.type}
                        onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as MaintenanceType }))}
                    >
                        <option value="PREVENTIVE">Preventiva</option>
                        <option value="CORRECTIVE">Corretiva</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none" htmlFor="priority">Prioridade</label>
                    <select
                        id="priority"
                        className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950" 
                        value={formData.priority}
                        onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as MaintenancePriority }))}
                    >
                        <option value="LOW">Baixa</option>
                        <option value="MEDIUM">Média</option>
                        <option value="HIGH">Alta</option>
                        <option value="CRITICAL">Crítica</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none" htmlFor="date">Data Agendada</label>
                    <input 
                        id="date"
                        type="date"
                        required
                        className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950" 
                        value={formData.scheduledDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none" htmlFor="cost">Custo Estimado (R$)</label>
                    <input 
                        id="cost"
                        type="number"
                        step="0.01"
                        className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950" 
                        value={formData.cost}
                        onChange={(e) => setFormData(prev => ({ ...prev, cost: parseFloat(e.target.value) }))}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium leading-none" htmlFor="supplier">Fornecedor Responsável</label>
                <select
                    id="supplier"
                    className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950" 
                    value={formData.supplierId}
                    onChange={(e) => setFormData(prev => ({ ...prev, supplierId: e.target.value }))}
                >
                    <option value="">Selecione um fornecedor...</option>
                    {suppliers.filter(s => s.active).map(s => (
                        <option key={s.id} value={s.id}>{s.name} - {s.contact}</option>
                    ))}
                </select>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium leading-none" htmlFor="status">Status Atual</label>
                <select
                    id="status"
                    className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950" 
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as MaintenanceStatus }))}
                >
                    <option value="PENDING">Pendente</option>
                    <option value="IN_PROGRESS">Em Andamento</option>
                    <option value="COMPLETED">Concluído</option>
                    <option value="CANCELLED">Cancelado</option>
                </select>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                <Button type="submit">Salvar</Button>
            </div>
        </form>
      </Modal>
    </div>
  );
};