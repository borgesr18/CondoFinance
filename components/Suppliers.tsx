import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Icons } from './ui/Icons';
import { Modal } from './ui/Modal';
import { Supplier } from '../types';

interface SuppliersProps {
  initialSuppliers: Supplier[];
}

export const Suppliers: React.FC<SuppliersProps> = ({ initialSuppliers }) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Supplier>>({
    name: '',
    document: '',
    contact: '',
    pixKey: '',
    active: true
  });

  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.document.includes(searchTerm)
  );

  const activeCount = suppliers.filter(s => s.active).length;

  // Actions
  const handleOpenModal = (supplier?: Supplier) => {
    if (supplier) {
      setEditingSupplier(supplier);
      setFormData(supplier);
    } else {
      setEditingSupplier(null);
      setFormData({ name: '', document: '', contact: '', pixKey: '', active: true, condoId: 'c1' });
    }
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja remover este fornecedor? Histórico financeiro pode ser afetado.')) {
        setSuppliers(prev => prev.filter(s => s.id !== id));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingSupplier) {
        // Update
        setSuppliers(prev => prev.map(s => s.id === editingSupplier.id ? { ...s, ...formData } as Supplier : s));
    } else {
        // Create
        const newSupplier: Supplier = {
            ...formData,
            id: `sup-${Date.now()}`,
            condoId: 'c1',
        } as Supplier;
        setSuppliers(prev => [newSupplier, ...prev]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Fornecedores</h2>
          <p className="text-slate-500">Gerencie prestadores de serviço e empresas cadastradas.</p>
        </div>
        <Button className="gap-2" onClick={() => handleOpenModal()}>
          <Icons.Plus className="h-4 w-4" /> Novo Fornecedor
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-slate-600 text-sm font-medium">Total Cadastrado</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-slate-900">{suppliers.length}</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-slate-600 text-sm font-medium">Ativos</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-emerald-600">{activeCount}</div>
            </CardContent>
        </Card>
      </div>

      {/* List */}
      <Card>
        <CardHeader>
            <div className="relative w-full max-w-sm">
                <Icons.Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                <input
                    type="text"
                    placeholder="Buscar por nome ou CNPJ..."
                    className="flex h-9 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </CardHeader>
        <CardContent>
            <div className="rounded-md border border-slate-200 overflow-x-auto">
                <table className="w-full text-sm text-left min-w-[700px]">
                    <thead className="bg-slate-50 text-slate-500 font-medium">
                        <tr>
                            <th className="px-4 py-3">Empresa / Nome</th>
                            <th className="px-4 py-3">Documento</th>
                            <th className="px-4 py-3">Contato</th>
                            <th className="px-4 py-3">Chave PIX</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3 text-center w-[100px]">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredSuppliers.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                                    Nenhum fornecedor encontrado.
                                </td>
                            </tr>
                        ) : (
                            filteredSuppliers.map((s) => (
                                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-3 font-medium text-slate-900">{s.name}</td>
                                    <td className="px-4 py-3 text-slate-600">{s.document}</td>
                                    <td className="px-4 py-3 text-slate-600">{s.contact}</td>
                                    <td className="px-4 py-3 text-slate-600 font-mono text-xs">{s.pixKey || '-'}</td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium 
                                            ${s.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>
                                            {s.active ? 'Ativo' : 'Inativo'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex justify-center gap-1">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-blue-600" onClick={() => handleOpenModal(s)}>
                                                <Icons.Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-red-600" onClick={() => handleDelete(s.id)}>
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
        title={editingSupplier ? 'Editar Fornecedor' : 'Novo Fornecedor'}
      >
        <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium leading-none" htmlFor="name">Nome / Razão Social</label>
                <input 
                    id="name"
                    required
                    className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950" 
                    placeholder="Ex: Eletrica Silva Ltda"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none" htmlFor="doc">CNPJ / CPF</label>
                    <input 
                        id="doc"
                        required
                        className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950" 
                        placeholder="00.000.000/0000-00"
                        value={formData.document}
                        onChange={(e) => setFormData(prev => ({ ...prev, document: e.target.value }))}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none" htmlFor="status">Status</label>
                    <select
                        id="status"
                        className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950" 
                        value={formData.active ? 'true' : 'false'}
                        onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.value === 'true' }))}
                    >
                        <option value="true">Ativo</option>
                        <option value="false">Inativo</option>
                    </select>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium leading-none" htmlFor="contact">Contato (Tel / Email)</label>
                <input 
                    id="contact"
                    required
                    className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950" 
                    placeholder="(11) 99999-9999 ou email@empresa.com"
                    value={formData.contact}
                    onChange={(e) => setFormData(prev => ({ ...prev, contact: e.target.value }))}
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium leading-none" htmlFor="pix">Chave PIX (Opcional)</label>
                <input 
                    id="pix"
                    className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950" 
                    placeholder="Email, CPF ou Aleatória"
                    value={formData.pixKey}
                    onChange={(e) => setFormData(prev => ({ ...prev, pixKey: e.target.value }))}
                />
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                <Button type="submit">Salvar</Button>
            </div>
        </form>
      </Modal>
    </div>
  );
};