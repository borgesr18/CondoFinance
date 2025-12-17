import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Icons } from './ui/Icons';
import { Modal } from './ui/Modal';
import { Billing, Unit, UserRole } from '../types';
import { MOCK_UNITS } from '../constants';

interface BillingsProps {
  billings: Billing[];
  userRole?: UserRole;
}

export const Billings: React.FC<BillingsProps> = ({ billings: initialBillings, userRole = 'ADMIN_CONDOMINIO' }) => {
  const [billings, setBillings] = useState<Billing[]>(initialBillings);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  
  // Modals state
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isStatementOpen, setIsStatementOpen] = useState(false);
  const [selectedBilling, setSelectedBilling] = useState<Billing | null>(null);

  // Generation Form
  const [generationData, setGenerationData] = useState({
    month: new Date().toISOString().slice(0, 7), // YYYY-MM
    totalValue: 0,
    dueDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 10).toISOString().split('T')[0],
    mode: 'EQUAL' as 'EQUAL' | 'FRACTION', // New state for calculation mode
  });

  // Payment Form
  const [paymentData, setPaymentData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    obs: '',
  });

  const isResident = userRole === 'MORADOR';

  // Stats
  const totalReceived = billings.filter(b => b.status === 'PAGA').reduce((acc, b) => acc + b.amount, 0);
  const totalPending = billings.filter(b => b.status === 'ABERTA' || b.status === 'ATRASADA').reduce((acc, b) => acc + b.amount, 0);
  const overdueCount = billings.filter(b => b.status === 'ATRASADA').length;

  // Mock PIX Key for the condo
  const CONDO_PIX_KEY = "12.345.678/0001-90";

  // Helper to calculate estimated value per unit for preview
  const estimatedValuePerUnit = generationData.totalValue > 0 
    ? (generationData.mode === 'EQUAL' 
        ? generationData.totalValue / MOCK_UNITS.length 
        : generationData.totalValue * (MOCK_UNITS[0]?.fraction || 0)) // Preview based on first unit for fraction
    : 0;

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newBillings: Billing[] = MOCK_UNITS.map(unit => {
        let amount = 0;
        
        if (generationData.totalValue > 0) {
            if (generationData.mode === 'EQUAL') {
                // Exact division
                amount = generationData.totalValue / MOCK_UNITS.length;
            } else {
                // Fraction based
                amount = generationData.totalValue * unit.fraction;
            }
        } else {
            amount = 850.00; // Default fallback
        }

        // Round to 2 decimals to avoid floating point issues (e.g. 119.99999)
        amount = Math.round(amount * 100) / 100;

        return {
            id: `bill-${Date.now()}-${unit.id}`,
            condoId: unit.condoId,
            unitId: unit.id,
            unitCode: unit.code,
            competenceDate: `${generationData.month}-01`,
            amount: amount,
            status: 'ABERTA',
            dueDate: generationData.dueDate
        };
    });
    
    setBillings(prev => [...newBillings, ...prev]);
    setIsGenerateOpen(false);
    alert(`${newBillings.length} cobranças geradas com sucesso para ${generationData.month}!`);
  };

  const openPaymentModal = (billing: Billing) => {
    setSelectedBilling(billing);
    
    // Check if overdue to suggest interest (Simple logic: 2% fine + 1% interest/mo)
    const today = new Date();
    const due = new Date(billing.dueDate);
    let suggestAmount = billing.amount;
    
    if (today > due && billing.status !== 'PAGA') {
        const diffTime = Math.abs(today.getTime() - due.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        if (diffDays > 0) {
            const fine = billing.amount * 0.02; // 2%
            const interest = (billing.amount * 0.01 / 30) * diffDays; // 1% pm pro-rata
            suggestAmount = billing.amount + fine + interest;
        }
    }

    setPaymentData({
        date: new Date().toISOString().split('T')[0],
        amount: parseFloat(suggestAmount.toFixed(2)),
        obs: ''
    });
    setIsPaymentOpen(true);
  };

  const confirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBilling) return;

    setBillings(prev => prev.map(b => 
        b.id === selectedBilling.id 
        ? { ...b, status: 'PAGA', amount: paymentData.amount } // Update amount if paid with interest
        : b
    ));
    setIsPaymentOpen(false);
  };

  const copyPixToClipboard = () => {
    navigator.clipboard.writeText(CONDO_PIX_KEY);
    alert("Chave PIX copiada!");
  };

  const filtered = billings.filter(b => filterStatus === 'ALL' || b.status === filterStatus);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              {isResident ? 'Minhas Cobranças' : 'Conciliação PIX'}
          </h2>
          <p className="text-slate-500">
              {isResident ? 'Histórico de faturas e segunda via.' : 'Gestão manual de recebimentos e geração de rateio.'}
          </p>
        </div>
        <div className="flex gap-2">
            {/* Helper for Admin to send PIX key to residents */}
            {!isResident && (
                <Button variant="outline" className="gap-2 text-slate-600" onClick={copyPixToClipboard}>
                    <Icons.Copy className="h-4 w-4" /> Copiar Chave PIX
                </Button>
            )}
            {!isResident && userRole !== 'CONSELHO' && (
                <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setIsGenerateOpen(true)}>
                    <Icons.Plus className="h-4 w-4" /> Gerar Mensalidade
                </Button>
            )}
        </div>
      </div>

      {/* Stats Cards - Only for Admin */}
      {!isResident && (
        <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-slate-50 border-slate-200">
                <CardHeader className="pb-2">
                    <CardTitle className="text-slate-600 text-sm font-medium">A Receber (Aberto)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-slate-900">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPending)}
                    </div>
                    <div className="text-xs text-amber-600 font-medium mt-1 flex items-center gap-1">
                        <Icons.AlertCircle className="h-3 w-3" />
                        {overdueCount} faturas vencidas
                    </div>
                </CardContent>
            </Card>
            <Card className="bg-emerald-50 border-emerald-200">
                <CardHeader className="pb-2">
                    <CardTitle className="text-emerald-700 text-sm font-medium">Recebido (Conciliado)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-emerald-900">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalReceived)}
                    </div>
                    <p className="text-xs text-emerald-600">Entrada via PIX</p>
                </CardContent>
            </Card>
            <Card className="bg-blue-50 border-blue-200">
                <CardHeader className="pb-2">
                    <CardTitle className="text-blue-700 text-sm font-medium">Conta de Recebimento</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-sm font-bold text-blue-900">Banco XPTO</div>
                    <div className="text-xs text-blue-700 mt-1">Chave: {CONDO_PIX_KEY}</div>
                    <div className="text-xs text-blue-600/70">CNPJ</div>
                </CardContent>
            </Card>
        </div>
      )}

      {/* Main Table */}
      <Card>
        <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    <Button variant={filterStatus === 'ALL' ? 'default' : 'outline'} size="sm" onClick={() => setFilterStatus('ALL')}>Todas</Button>
                    <Button variant={filterStatus === 'ABERTA' ? 'default' : 'outline'} size="sm" onClick={() => setFilterStatus('ABERTA')}>Em Aberto</Button>
                    <Button variant={filterStatus === 'PAGA' ? 'default' : 'outline'} size="sm" onClick={() => setFilterStatus('PAGA')}>Pagas</Button>
                    <Button variant={filterStatus === 'ATRASADA' ? 'default' : 'outline'} size="sm" onClick={() => setFilterStatus('ATRASADA')}>Atrasadas</Button>
                </div>
                <div className="text-sm text-slate-500 hidden md:block">
                    {filtered.length} registros encontrados
                </div>
            </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-slate-200 overflow-x-auto">
            <table className="w-full text-sm text-left min-w-[700px]">
              <thead className="bg-slate-50 text-slate-500 font-medium">
                <tr>
                  <th className="px-4 py-3">Unidade</th>
                  <th className="px-4 py-3">Referência</th>
                  <th className="px-4 py-3">Vencimento</th>
                  <th className="px-4 py-3 text-right">Valor</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center w-[160px]">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900">
                        {b.unitCode}
                        <div className="text-xs text-slate-400 font-normal">ID: {b.id.slice(-6)}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 capitalize">
                        {new Date(b.competenceDate).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                        {new Date(b.dueDate).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(b.amount)}
                    </td>
                    <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border 
                            ${b.status === 'PAGA' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 
                              b.status === 'ATRASADA' ? 'bg-red-100 text-red-700 border-red-200' :
                              'bg-amber-100 text-amber-700 border-amber-200'
                            }`}>
                            {b.status}
                        </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-1">
                            {/* Allow manual payment action only for Admin/Financeiro */}
                            {!isResident && b.status !== 'PAGA' && (
                                <Button 
                                    size="sm" 
                                    className="h-8 px-2 bg-emerald-600 hover:bg-emerald-700 text-white gap-1" 
                                    onClick={() => openPaymentModal(b)}
                                    title="Dar Baixa Manual"
                                >
                                    <Icons.Check className="h-3 w-3" />
                                    Baixar
                                </Button>
                            )}
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-slate-500" 
                                title="Ver Demonstrativo"
                                onClick={() => {
                                    setSelectedBilling(b);
                                    setIsStatementOpen(true);
                                }}
                            >
                                <Icons.FileText className="h-4 w-4" />
                            </Button>
                        </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal: Gerar Cobranças */}
      <Modal 
        isOpen={isGenerateOpen} 
        onClose={() => setIsGenerateOpen(false)}
        title="Gerar Cobranças em Lote"
      >
        <form onSubmit={handleGenerate} className="space-y-4">
            <div className="p-3 bg-blue-50 text-blue-800 rounded-md text-sm border border-blue-100">
                <Icons.AlertCircle className="inline h-4 w-4 mr-1 -mt-0.5" />
                Isso criará uma obrigação de pagamento para <strong>todas as {MOCK_UNITS.length} unidades</strong> cadastradas.
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Mês de Competência</label>
                    <input 
                        type="month"
                        required
                        className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm"
                        value={generationData.month}
                        onChange={(e) => setGenerationData(prev => ({ ...prev, month: e.target.value }))}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Data de Vencimento</label>
                    <input 
                        type="date"
                        required
                        className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm"
                        value={generationData.dueDate}
                        onChange={(e) => setGenerationData(prev => ({ ...prev, dueDate: e.target.value }))}
                    />
                </div>
            </div>

            <div className="space-y-3 pt-2">
                <label className="text-sm font-medium block">Forma de Cálculo do Rateio</label>
                <div className="grid grid-cols-2 gap-4">
                    <button
                        type="button"
                        onClick={() => setGenerationData(prev => ({ ...prev, mode: 'EQUAL' }))}
                        className={`flex flex-col items-center justify-center p-3 rounded-lg border text-sm transition-all ${
                            generationData.mode === 'EQUAL' 
                            ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500' 
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                    >
                        <span className="font-semibold">Divisão Igualitária</span>
                        <span className="text-xs mt-1">Total ÷ Nº Unidades</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setGenerationData(prev => ({ ...prev, mode: 'FRACTION' }))}
                        className={`flex flex-col items-center justify-center p-3 rounded-lg border text-sm transition-all ${
                            generationData.mode === 'FRACTION' 
                            ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500' 
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                    >
                        <span className="font-semibold">Fração Ideal</span>
                        <span className="text-xs mt-1">Total × Fração da Unidade</span>
                    </button>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Valor Total do Rateio (R$)</label>
                <input 
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="flex h-11 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-lg font-bold text-slate-900 shadow-sm focus:ring-2 focus:ring-blue-500"
                    value={generationData.totalValue}
                    onChange={(e) => setGenerationData(prev => ({ ...prev, totalValue: parseFloat(e.target.value) || 0 }))}
                />
                
                {/* Visual Preview */}
                <div className="mt-2 p-3 bg-slate-50 rounded-md border border-slate-200 space-y-2">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500">Valor Total Formatado:</span>
                        <span className="font-bold text-slate-900">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(generationData.totalValue)}
                        </span>
                    </div>
                    <div className="flex justify-between items-center text-sm pt-2 border-t border-slate-200">
                        <span className="text-slate-500">Estimativa por Unidade {generationData.mode === 'FRACTION' && '(Média)'}:</span>
                        <span className="font-bold text-emerald-600 text-lg">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(estimatedValuePerUnit)}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="ghost" onClick={() => setIsGenerateOpen(false)}>Cancelar</Button>
                <Button type="submit">Confirmar Geração</Button>
            </div>
        </form>
      </Modal>

      {/* Modal: Baixa Manual de PIX */}
      <Modal 
        isOpen={isPaymentOpen} 
        onClose={() => setIsPaymentOpen(false)}
        title="Baixa Manual de PIX"
      >
        <form onSubmit={confirmPayment} className="space-y-4">
            {selectedBilling && (
                <div className="bg-slate-50 p-3 rounded-md border border-slate-200 mb-4">
                    <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-slate-700">{selectedBilling.unitCode}</span>
                        <span className="text-xs text-slate-500">Vencimento: {new Date(selectedBilling.dueDate).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="text-sm text-slate-600">
                        Valor Original: <strong>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedBilling.amount)}</strong>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Data do Pagamento</label>
                    <input 
                        type="date"
                        required
                        className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm"
                        value={paymentData.date}
                        onChange={(e) => setPaymentData(prev => ({ ...prev, date: e.target.value }))}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Valor Recebido (R$)</label>
                    <input 
                        type="number"
                        step="0.01"
                        required
                        className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm font-bold text-slate-900"
                        value={paymentData.amount}
                        onChange={(e) => setPaymentData(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
                    />
                    {selectedBilling && paymentData.amount > selectedBilling.amount && (
                         <span className="text-xs text-amber-600">Incluindo juros/multa.</span>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Anexar Comprovante PIX</label>
                <div className="border-2 border-dashed border-slate-300 rounded-md p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition cursor-pointer">
                    <Icons.FileCheck className="h-8 w-8 text-slate-400 mb-2" />
                    <span className="text-sm text-slate-600">Clique para upload da imagem</span>
                    <span className="text-xs text-slate-400">(Simulado)</span>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Observações</label>
                <textarea 
                    className="flex min-h-[60px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm"
                    placeholder="Ex: Pagamento realizado pelo inquilino..."
                    value={paymentData.obs}
                    onChange={(e) => setPaymentData(prev => ({ ...prev, obs: e.target.value }))}
                />
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="ghost" onClick={() => setIsPaymentOpen(false)}>Cancelar</Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">Confirmar Recebimento</Button>
            </div>
        </form>
      </Modal>

      {/* Modal: Demonstrativo (Substituto do Boleto) */}
      <Modal 
        isOpen={isStatementOpen} 
        onClose={() => setIsStatementOpen(false)}
        title="Demonstrativo de Cobrança"
      >
        {selectedBilling && (
            <div className="space-y-6">
                <div className="text-center border-b border-slate-100 pb-4">
                    <h3 className="font-bold text-lg text-slate-900">Condomínio Residencial Jardins</h3>
                    <p className="text-sm text-slate-500">Recibo / Aviso de Cobrança</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-slate-500 text-xs">Unidade</p>
                        <p className="font-semibold">{selectedBilling.unitCode}</p>
                    </div>
                    <div>
                        <p className="text-slate-500 text-xs">Competência</p>
                        <p className="font-semibold">{new Date(selectedBilling.competenceDate).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</p>
                    </div>
                    <div>
                        <p className="text-slate-500 text-xs">Vencimento</p>
                        <p className="font-semibold text-red-600">{new Date(selectedBilling.dueDate).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div>
                        <p className="text-slate-500 text-xs">Valor Total</p>
                        <p className="font-bold text-lg text-slate-900">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedBilling.amount)}
                        </p>
                    </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-slate-700">Dados para Pagamento (PIX)</span>
                        <Icons.QrCode className="h-5 w-5 text-slate-400" />
                    </div>
                    <div className="bg-white p-2 rounded border border-slate-200 text-center font-mono text-sm break-all">
                        {CONDO_PIX_KEY}
                    </div>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full mt-2 text-blue-600 hover:bg-blue-50"
                        onClick={copyPixToClipboard}
                    >
                        <Icons.Copy className="h-3 w-3 mr-2" /> Copiar Chave
                    </Button>
                </div>

                <div className="text-xs text-slate-500 text-center">
                    <p>Favor enviar o comprovante para a administração após o pagamento.</p>
                    <p>Multa de 2% e Juros de 1% a.m. após o vencimento.</p>
                </div>

                <div className="flex justify-end pt-2">
                    <Button variant="outline" className="w-full" onClick={() => alert("PDF baixado (simulado)")}>
                        <Icons.Download className="h-4 w-4 mr-2" /> Baixar PDF
                    </Button>
                </div>
            </div>
        )}
      </Modal>
    </div>
  );
};