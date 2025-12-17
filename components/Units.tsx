import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Icons } from './ui/Icons';
import { Modal } from './ui/Modal';
import { Unit } from '../types';

interface UnitsProps {
  initialUnits: Unit[];
}

export const Units: React.FC<UnitsProps> = ({ initialUnits }) => {
  const [units, setUnits] = useState<Unit[]>(initialUnits);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Unit>>({
    code: '',
    block: '',
    ownerName: '',
    fraction: 0,
  });

  const filteredUnits = units.filter(
    (u) =>
      u.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.block && u.block.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalFraction = units.reduce((acc, curr) => acc + curr.fraction, 0);

  const handleOpenModal = (unit?: Unit) => {
    if (unit) {
      setEditingUnit(unit);
      setFormData(unit);
    } else {
      setEditingUnit(null);
      setFormData({ code: '', block: '', ownerName: '', fraction: 0, condoId: 'c1' });
    }
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta unidade?')) {
        setUnits(prev => prev.filter(u => u.id !== id));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingUnit) {
        // Update
        setUnits(prev => prev.map(u => u.id === editingUnit.id ? { ...u, ...formData } as Unit : u));
    } else {
        // Create
        const newUnit: Unit = {
            ...formData,
            id: `unit-${Date.now()}`,
            condoId: 'c1',
        } as Unit;
        setUnits(prev => [...prev, newUnit]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Unidades</h2>
          <p className="text-slate-500">Gerencie apartamentos, proprietários e frações ideais.</p>
        </div>
        <Button className="gap-2" onClick={() => handleOpenModal()}>
          <Icons.Plus className="h-4 w-4" /> Nova Unidade
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-slate-600 text-sm font-medium">Total de Unidades</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-slate-900">{units.length}</div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-slate-600 text-sm font-medium">Soma das Frações</CardTitle>
            </CardHeader>
            <CardContent>
                <div className={`text-2xl font-bold ${Math.abs(totalFraction - 1) > 0.01 && totalFraction > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {(totalFraction * 100).toFixed(4)}%
                </div>
                {Math.abs(totalFraction - 1) > 0.01 && totalFraction > 0 && (
                    <p className="text-xs text-amber-600">Atenção: A soma deve ser 100%</p>
                )}
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
                    placeholder="Buscar unidade ou proprietário..."
                    className="flex h-9 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </CardHeader>
        <CardContent>
            <div className="rounded-md border border-slate-200 overflow-x-auto">
                <table className="w-full text-sm text-left min-w-[600px]">
                    <thead className="bg-slate-50 text-slate-500 font-medium">
                        <tr>
                            <th className="px-4 py-3">Unidade</th>
                            <th className="px-4 py-3">Bloco</th>
                            <th className="px-4 py-3">Proprietário</th>
                            <th className="px-4 py-3 text-right">Fração Ideal</th>
                            <th className="px-4 py-3 w-[100px] text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredUnits.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                                    Nenhuma unidade encontrada.
                                </td>
                            </tr>
                        ) : (
                            filteredUnits.map((u) => (
                                <tr key={u.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-4 py-3 font-medium text-slate-900">{u.code}</td>
                                    <td className="px-4 py-3 text-slate-600">{u.block || '-'}</td>
                                    <td className="px-4 py-3 text-slate-900">{u.ownerName}</td>
                                    <td className="px-4 py-3 text-right text-slate-600">{u.fraction.toFixed(6)}</td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex justify-center gap-1">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-blue-600" onClick={() => handleOpenModal(u)}>
                                                <Icons.Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-red-600" onClick={() => handleDelete(u.id)}>
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
        title={editingUnit ? 'Editar Unidade' : 'Nova Unidade'}
      >
        <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none" htmlFor="code">Código/Número</label>
                    <input 
                        id="code"
                        required
                        className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950" 
                        placeholder="Ex: APT 101"
                        value={formData.code}
                        onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none" htmlFor="block">Bloco/Torre</label>
                    <input 
                        id="block"
                        className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950" 
                        placeholder="Ex: Bloco A"
                        value={formData.block}
                        onChange={(e) => setFormData(prev => ({ ...prev, block: e.target.value }))}
                    />
                </div>
            </div>
            
            <div className="space-y-2">
                <label className="text-sm font-medium leading-none" htmlFor="owner">Proprietário</label>
                <input 
                    id="owner"
                    required
                    className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950" 
                    placeholder="Nome do responsável"
                    value={formData.ownerName}
                    onChange={(e) => setFormData(prev => ({ ...prev, ownerName: e.target.value }))}
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium leading-none" htmlFor="fraction">Fração Ideal (Decimal)</label>
                <input 
                    id="fraction"
                    type="number"
                    step="0.000001"
                    required
                    className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950" 
                    placeholder="0.008333"
                    value={formData.fraction}
                    onChange={(e) => setFormData(prev => ({ ...prev, fraction: parseFloat(e.target.value) }))}
                />
                <p className="text-[10px] text-slate-500">Usado para cálculo de rateio. Ex: 1/120 = 0.008333</p>
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