import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Icons } from './ui/Icons';
import { Modal } from './ui/Modal';
import { User, UserRole } from '../types';
import { MOCK_USER } from '../constants';

// --- MOCK USERS LIST ---
const INITIAL_USERS: User[] = [
  MOCK_USER, // The current logged in admin
  { id: 'u2', name: 'Ana Souza', email: 'ana.financeiro@condo.com', role: 'FINANCEIRO', avatarUrl: 'https://picsum.photos/101/101' },
  { id: 'u3', name: 'Roberto Lima', email: 'roberto.conselho@condo.com', role: 'CONSELHO', avatarUrl: 'https://picsum.photos/102/102' },
  { id: 'u4', name: 'Marcos Paulo', email: 'marcos@morador.com', role: 'MORADOR' }, // No avatar
  { id: 'u5', name: 'Juliana Paes', email: 'juliana@morador.com', role: 'MORADOR', avatarUrl: 'https://picsum.photos/103/103' },
  { id: 'u6', name: 'Portaria 24h', email: 'portaria@condo.com', role: 'ADMIN_CONDOMINIO' }, // Another admin/staff
];

export const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<User>>({
    name: '',
    email: '',
    role: 'MORADOR',
  });

  const roles: { value: UserRole; label: string; color: string }[] = [
    { value: 'MASTER', label: 'Master (Dono)', color: 'bg-slate-800 text-white' },
    { value: 'ADMIN_CONDOMINIO', label: 'Síndico / Admin', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    { value: 'FINANCEIRO', label: 'Financeiro', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    { value: 'CONSELHO', label: 'Conselho', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    { value: 'MORADOR', label: 'Morador', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  ];

  const getRoleBadge = (role: UserRole) => {
    const r = roles.find(item => item.value === role);
    return r ? (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${r.color}`}>
        {role === 'ADMIN_CONDOMINIO' && <Icons.Shield className="w-3 h-3 mr-1" />}
        {r.label}
      </span>
    ) : role;
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'ALL' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  // Actions
  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData(user);
    } else {
      setEditingUser(null);
      setFormData({ name: '', email: '', role: 'MORADOR' });
    }
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (id === MOCK_USER.id) {
        alert("Você não pode excluir a si mesmo.");
        return;
    }
    if (confirm('Tem certeza que deseja remover este usuário? Ele perderá o acesso imediatamente.')) {
        setUsers(prev => prev.filter(u => u.id !== id));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingUser) {
        // Update
        setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...formData } as User : u));
    } else {
        // Create (Invite)
        const newUser: User = {
            ...formData,
            id: `u-${Date.now()}`,
        } as User;
        setUsers(prev => [...prev, newUser]);
        alert(`Convite enviado para ${newUser.email}! (Simulado)`);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Usuários & Permissões</h2>
          <p className="text-slate-500">Gerencie quem tem acesso ao sistema e seus níveis de permissão.</p>
        </div>
        <Button className="gap-2" onClick={() => handleOpenModal()}>
          <Icons.UserPlus className="h-4 w-4" /> Convidar Membro
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
            <CardHeader className="pb-2"><CardTitle className="text-slate-600 text-sm">Total de Membros</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-slate-900">{users.length}</div></CardContent>
        </Card>
        <Card>
            <CardHeader className="pb-2"><CardTitle className="text-slate-600 text-sm">Administradores</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-emerald-700">{users.filter(u => u.role === 'ADMIN_CONDOMINIO' || u.role === 'MASTER').length}</div></CardContent>
        </Card>
        <Card>
            <CardHeader className="pb-2"><CardTitle className="text-slate-600 text-sm">Conselheiros</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-purple-700">{users.filter(u => u.role === 'CONSELHO').length}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
            <div className="flex flex-col md:flex-row gap-4 justify-between">
                <div className="relative w-full max-w-sm">
                    <Icons.Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Buscar por nome ou email..."
                        className="flex h-9 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="relative w-full md:w-48">
                    <select 
                        className="h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 appearance-none"
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                    >
                        <option value="ALL">Todos os Papéis</option>
                        {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                    <Icons.Filter className="absolute right-2 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
            </div>
        </CardHeader>
        <CardContent>
            <div className="rounded-md border border-slate-200 overflow-x-auto">
                <table className="w-full text-sm text-left min-w-[600px]">
                    <thead className="bg-slate-50 text-slate-500 font-medium">
                        <tr>
                            <th className="px-4 py-3">Membro</th>
                            <th className="px-4 py-3">Email</th>
                            <th className="px-4 py-3">Papel / Função</th>
                            <th className="px-4 py-3 text-center w-[120px]">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredUsers.length === 0 ? (
                            <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">Nenhum usuário encontrado.</td></tr>
                        ) : (
                            filteredUsers.map((u) => (
                                <tr key={u.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            {u.avatarUrl ? (
                                                <img src={u.avatarUrl} alt={u.name} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs border border-slate-300">
                                                    {u.name.substring(0,2).toUpperCase()}
                                                </div>
                                            )}
                                            <span className="font-medium text-slate-900">{u.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-slate-600">{u.email}</td>
                                    <td className="px-4 py-3">{getRoleBadge(u.role)}</td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex justify-center gap-1">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-blue-600" onClick={() => handleOpenModal(u)} title="Editar Permissões">
                                                <Icons.Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-red-600" onClick={() => handleDelete(u.id)} title="Remover Usuário">
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

      {/* Invite/Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Editar Permissões' : 'Convidar Novo Membro'}
      >
        <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium leading-none" htmlFor="name">Nome Completo</label>
                <input 
                    id="name"
                    required
                    className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950" 
                    placeholder="Ex: João da Silva"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
            </div>
            
            <div className="space-y-2">
                <label className="text-sm font-medium leading-none" htmlFor="email">Email de Acesso</label>
                <input 
                    id="email"
                    type="email"
                    required
                    disabled={!!editingUser} // Can't change email of existing user easily
                    className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:bg-slate-100 disabled:text-slate-500" 
                    placeholder="Ex: joao@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
                {!editingUser && <p className="text-[10px] text-slate-500">Enviaremos um convite para este email.</p>}
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium leading-none" htmlFor="role">Papel / Função</label>
                <select
                    id="role"
                    required
                    className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950" 
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as UserRole }))}
                >
                    {roles.map(r => (
                        <option key={r.value} value={r.value}>
                            {r.label}
                        </option>
                    ))}
                </select>
                <div className="p-3 bg-slate-50 rounded text-xs text-slate-600 border border-slate-100">
                    {formData.role === 'ADMIN_CONDOMINIO' && 'Acesso total: Financeiro, Usuários, Configurações.'}
                    {formData.role === 'FINANCEIRO' && 'Pode gerenciar lançamentos e cobranças.'}
                    {formData.role === 'CONSELHO' && 'Visualiza relatórios e aprova despesas.'}
                    {formData.role === 'MORADOR' && 'Acesso restrito apenas aos seus boletos e comunicados.'}
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                <Button type="submit">{editingUser ? 'Salvar Alterações' : 'Enviar Convite'}</Button>
            </div>
        </form>
      </Modal>
    </div>
  );
};