import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Icons } from './ui/Icons';
import { Condo } from '../types';

interface SettingsProps {
  condo: Condo;
}

export const Settings: React.FC<SettingsProps> = ({ condo: initialCondo }) => {
  const [condo, setCondo] = useState<Condo>(initialCondo);
  const [activeTab, setActiveTab] = useState<'GENERAL' | 'FINANCIAL'>('GENERAL');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      alert('Configurações salvas com sucesso!');
    }, 800);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Configurações</h2>
          <p className="text-slate-500">Gerencie dados do condomínio e parâmetros do sistema.</p>
        </div>
        <Button className="gap-2" onClick={handleSave} disabled={isLoading}>
          <Icons.Check className="h-4 w-4" /> 
          {isLoading ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 rounded-xl bg-slate-100 p-1 w-full md:w-fit">
        <button
            onClick={() => setActiveTab('GENERAL')}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium leading-5 transition-all ${
                activeTab === 'GENERAL' 
                ? 'bg-white text-blue-700 shadow ring-1 ring-black/5' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
            }`}
        >
            <Icons.Building className="h-4 w-4" />
            Dados Cadastrais
        </button>
        <button
            onClick={() => setActiveTab('FINANCIAL')}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium leading-5 transition-all ${
                activeTab === 'FINANCIAL' 
                ? 'bg-white text-blue-700 shadow ring-1 ring-black/5' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
            }`}
        >
            <Icons.Banknote className="h-4 w-4" />
            Financeiro
        </button>
      </div>

      <form onSubmit={handleSave}>
        {/* TAB: GENERAL */}
        {activeTab === 'GENERAL' && (
            <Card>
                <CardHeader>
                    <CardTitle>Identificação do Condomínio</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none" htmlFor="name">Nome do Condomínio</label>
                            <input 
                                id="name"
                                required
                                className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm focus:ring-1 focus:ring-slate-950" 
                                value={condo.name}
                                onChange={(e) => setCondo({ ...condo, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none" htmlFor="cnpj">CNPJ</label>
                            <input 
                                id="cnpj"
                                className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm focus:ring-1 focus:ring-slate-950" 
                                value={condo.cnpj}
                                onChange={(e) => setCondo({ ...condo, cnpj: e.target.value })}
                                placeholder="00.000.000/0000-00"
                            />
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none" htmlFor="address">Endereço Completo</label>
                        <input 
                            id="address"
                            className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm focus:ring-1 focus:ring-slate-950" 
                            value={condo.address}
                            onChange={(e) => setCondo({ ...condo, address: e.target.value })}
                        />
                    </div>
                </CardContent>
            </Card>
        )}

        {/* TAB: FINANCIAL */}
        {activeTab === 'FINANCIAL' && (
            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Regras de Cobrança (Inadimplência)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none" htmlFor="dueDate">Dia de Vencimento Padrão</label>
                                <select
                                    id="dueDate"
                                    className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm focus:ring-1 focus:ring-slate-950" 
                                    value={condo.defaultDueDay}
                                    onChange={(e) => setCondo({ ...condo, defaultDueDay: parseInt(e.target.value) })}
                                >
                                    {[1, 5, 10, 15, 20, 25, 30].map(d => (
                                        <option key={d} value={d}>Dia {d}</option>
                                    ))}
                                </select>
                                <p className="text-[10px] text-slate-500">Usado ao gerar novas cobranças em massa.</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none" htmlFor="fine">Multa por Atraso (%)</label>
                                <div className="relative">
                                    <input 
                                        id="fine"
                                        type="number"
                                        step="0.1"
                                        className="flex h-9 w-full rounded-md border border-slate-200 bg-white pl-3 pr-8 py-1 text-sm shadow-sm focus:ring-1 focus:ring-slate-950" 
                                        value={condo.finePercent}
                                        onChange={(e) => setCondo({ ...condo, finePercent: parseFloat(e.target.value) })}
                                    />
                                    <span className="absolute right-3 top-2 text-xs text-slate-500">%</span>
                                </div>
                                <p className="text-[10px] text-slate-500">Multa única aplicada após vencimento (Padrão Legal: 2%).</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none" htmlFor="interest">Juros Mensais (%)</label>
                                <div className="relative">
                                    <input 
                                        id="interest"
                                        type="number"
                                        step="0.1"
                                        className="flex h-9 w-full rounded-md border border-slate-200 bg-white pl-3 pr-8 py-1 text-sm shadow-sm focus:ring-1 focus:ring-slate-950" 
                                        value={condo.interestPercent}
                                        onChange={(e) => setCondo({ ...condo, interestPercent: parseFloat(e.target.value) })}
                                    />
                                    <span className="absolute right-3 top-2 text-xs text-slate-500">% a.m.</span>
                                </div>
                                <p className="text-[10px] text-slate-500">Juros de mora pro-rata die (Padrão Legal: 1%).</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Controle de Despesas</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none" htmlFor="attachLimit">Exigir Comprovante acima de (R$)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2 text-xs text-slate-500">R$</span>
                                    <input 
                                        id="attachLimit"
                                        type="number"
                                        step="10.00"
                                        className="flex h-9 w-full rounded-md border border-slate-200 bg-white pl-8 pr-3 py-1 text-sm shadow-sm focus:ring-1 focus:ring-slate-950" 
                                        value={condo.attachmentRequiredAbove}
                                        onChange={(e) => setCondo({ ...condo, attachmentRequiredAbove: parseFloat(e.target.value) })}
                                    />
                                </div>
                                <p className="text-[10px] text-slate-500">Despesas acima deste valor não poderão ser aprovadas sem anexo.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )}
      </form>
    </div>
  );
};