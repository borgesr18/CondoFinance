import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Icons } from './ui/Icons';
import { Modal } from './ui/Modal';
import { MOCK_USER, MOCK_COMMON_AREAS, MOCK_RESERVATIONS } from '../constants';
import { CommonArea, Reservation, ReservationStatus } from '../types';

export const Reservations: React.FC = () => {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState<'AREAS' | 'MY_RESERVATIONS' | 'MANAGE_AREAS' | 'REQUESTS'>('AREAS');
  
  // Data
  const [areas, setAreas] = useState<CommonArea[]>(MOCK_COMMON_AREAS);
  const [reservations, setReservations] = useState<Reservation[]>(MOCK_RESERVATIONS);

  // Modals
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isAreaModalOpen, setIsAreaModalOpen] = useState(false);

  // Selected Items
  const [selectedArea, setSelectedArea] = useState<CommonArea | null>(null);
  const [bookingDate, setBookingDate] = useState('');
  
  // Area Form State
  const defaultAreaForm: CommonArea = {
    id: '',
    name: '',
    capacity: 0,
    fee: 0,
    imageUrl: '',
    description: '',
    rules: '',
    active: true
  };
  const [areaFormData, setAreaFormData] = useState<CommonArea>(defaultAreaForm);
  const [isEditingArea, setIsEditingArea] = useState(false);

  // --- ACTIONS: BOOKING ---
  
  const handleOpenBookModal = (area: CommonArea) => {
    setSelectedArea(area);
    setBookingDate('');
    setIsBookModalOpen(true);
  };

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedArea || !bookingDate) return;

    // Validation: Check double booking
    const exists = reservations.find(r => 
        r.areaId === selectedArea.id && 
        r.date === bookingDate && 
        r.status !== 'CANCELLED' && 
        r.status !== 'REJECTED'
    );

    if (exists) {
        alert('Já existe uma reserva para esta data e local.');
        return;
    }

    const newReservation: Reservation = {
        id: `res-${Date.now()}`,
        areaId: selectedArea.id,
        areaName: selectedArea.name,
        userId: MOCK_USER.id,
        userName: MOCK_USER.name,
        date: bookingDate,
        startTime: '12:00', // Mock time
        status: selectedArea.fee > 0 ? 'PENDING' : 'CONFIRMED',
        createdAt: new Date().toISOString()
    };

    setReservations(prev => [...prev, newReservation]);
    setIsBookModalOpen(false);
    
    if (selectedArea.fee > 0) {
        alert(`Solicitação enviada! Valor: R$ ${selectedArea.fee.toFixed(2)}. Aguarde aprovação.`);
    } else {
        alert('Reserva confirmada com sucesso!');
    }
    
    setActiveTab('MY_RESERVATIONS');
  };

  const handleCancelReservation = (id: string) => {
    if(confirm('Deseja cancelar esta reserva?')) {
        setReservations(prev => prev.map(r => r.id === id ? { ...r, status: 'CANCELLED' } : r));
    }
  };

  // --- ACTIONS: ADMIN AREA CRUD ---

  const handleOpenAreaModal = (area?: CommonArea) => {
    if (area) {
        setAreaFormData(area);
        setIsEditingArea(true);
    } else {
        setAreaFormData({ ...defaultAreaForm });
        setIsEditingArea(false);
    }
    setIsAreaModalOpen(true);
  };

  const handleSaveArea = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditingArea) {
        setAreas(prev => prev.map(a => a.id === areaFormData.id ? areaFormData : a));
    } else {
        const newArea = { ...areaFormData, id: `area-${Date.now()}` };
        setAreas(prev => [...prev, newArea]);
    }
    setIsAreaModalOpen(false);
  };

  const handleDeleteArea = (id: string) => {
    if (confirm('Tem certeza? Isso inativará a área e impedirá novas reservas.')) {
        // Soft delete logic (or hard delete if preferred, keeping soft for safety)
        setAreas(prev => prev.filter(a => a.id !== id));
    }
  };

  // --- ACTIONS: ADMIN REQUESTS ---

  const handleApproveReject = (id: string, newStatus: ReservationStatus) => {
    setReservations(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
  };

  // --- RENDER HELPERS ---
  
  const pendingReservations = reservations.filter(r => r.status === 'PENDING');
  const myReservations = reservations.filter(r => r.userId === MOCK_USER.id);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Reservas & Áreas Comuns</h2>
          <p className="text-slate-500">Agende espaços de lazer ou gerencie a disponibilidade.</p>
        </div>
        
        {/* Mock Role Switcher (Hidden in real app, user role based) */}
        <div className="flex bg-slate-100 p-1 rounded-lg self-start">
            <button 
                onClick={() => setActiveTab('AREAS')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'AREAS' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
            >
                Reservar
            </button>
            <button 
                onClick={() => setActiveTab('MY_RESERVATIONS')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'MY_RESERVATIONS' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
            >
                Minhas
            </button>
            {/* Admin Only Tabs */}
            {['ADMIN_CONDOMINIO', 'MASTER', 'CONSELHO'].includes(MOCK_USER.role) && (
                <>
                <div className="w-px bg-slate-300 mx-1"></div>
                <button 
                    onClick={() => setActiveTab('MANAGE_AREAS')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === 'MANAGE_AREAS' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Gerenciar Áreas
                </button>
                <button 
                    onClick={() => setActiveTab('REQUESTS')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1 ${activeTab === 'REQUESTS' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Solicitações
                    {pendingReservations.length > 0 && (
                        <span className="bg-red-500 text-white text-[9px] px-1 rounded-full">{pendingReservations.length}</span>
                    )}
                </button>
                </>
            )}
        </div>
      </div>

      {/* --- VIEW: AREAS LIST (User) --- */}
      {activeTab === 'AREAS' && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {areas.filter(a => a.active).map(area => (
                <Card key={area.id} className="overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
                    <div className="h-48 w-full bg-slate-200 relative overflow-hidden">
                        <img 
                            src={area.imageUrl || "https://placehold.co/600x400?text=Sem+Imagem"} 
                            alt={area.name} 
                            className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                        />
                        <div className="absolute top-2 right-2 bg-white/95 backdrop-blur px-2 py-1 rounded text-xs font-bold text-slate-900 shadow-sm">
                            {area.fee === 0 ? 'GRATUITO' : `R$ ${area.fee.toFixed(2)}`}
                        </div>
                    </div>
                    <CardHeader className="pb-2">
                        <CardTitle className="flex justify-between items-start">
                            <span>{area.name}</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">
                        <p className="text-sm text-slate-500 mb-4 flex-1 line-clamp-3">{area.description}</p>
                        
                        <div className="space-y-3">
                            <div className="flex items-center gap-4 text-xs text-slate-600">
                                <div className="flex items-center gap-1">
                                    <Icons.Users className="h-3 w-3" /> Cap. {area.capacity}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Icons.Clock className="h-3 w-3" /> 08:00 - 22:00
                                </div>
                            </div>
                            
                            {area.rules && (
                                <div className="p-2 bg-amber-50 rounded border border-amber-100 text-[10px] text-amber-800 line-clamp-2">
                                    <span className="font-bold">Regras:</span> {area.rules}
                                </div>
                            )}

                            <Button className="w-full gap-2" onClick={() => handleOpenBookModal(area)}>
                                <Icons.Calendar className="h-4 w-4" /> Reservar Agora
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
          </div>
      )}

      {/* --- VIEW: MY RESERVATIONS --- */}
      {activeTab === 'MY_RESERVATIONS' && (
          <Card>
              <CardHeader>
                  <CardTitle>Histórico de Agendamentos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border border-slate-200 overflow-x-auto">
                    <table className="w-full text-sm text-left min-w-[600px]">
                        <thead className="bg-slate-50 text-slate-500 font-medium">
                            <tr>
                                <th className="px-4 py-3">Área</th>
                                <th className="px-4 py-3">Data</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 w-[100px] text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {myReservations.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                                        Você não possui reservas.
                                    </td>
                                </tr>
                            ) : (
                                myReservations.map(res => (
                                    <tr key={res.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 font-medium text-slate-900">
                                            {res.areaName}
                                        </td>
                                        <td className="px-4 py-3 text-slate-600">
                                            {new Date(res.date).toLocaleDateString('pt-BR')} às {res.startTime}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium 
                                                ${res.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' : 
                                                  res.status === 'PENDING' ? 'bg-amber-100 text-amber-800' : 
                                                  res.status === 'CANCELLED' ? 'bg-slate-100 text-slate-500' :
                                                  'bg-red-100 text-red-800'}`}>
                                                {res.status === 'CONFIRMED' ? 'Confirmada' : 
                                                 res.status === 'PENDING' ? 'Em Análise' :
                                                 res.status === 'CANCELLED' ? 'Cancelada' : 'Rejeitada'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {res.status !== 'CANCELLED' && res.status !== 'REJECTED' && (
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600" onClick={() => handleCancelReservation(res.id)} title="Cancelar">
                                                    <Icons.Trash className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
              </CardContent>
          </Card>
      )}

      {/* --- VIEW: MANAGE AREAS (Admin) --- */}
      {activeTab === 'MANAGE_AREAS' && (
         <div className="space-y-4">
            <div className="flex justify-end">
                <Button onClick={() => handleOpenAreaModal()} className="gap-2">
                    <Icons.Plus className="h-4 w-4" /> Nova Área Comum
                </Button>
            </div>
            <Card>
                <CardContent className="p-0">
                    <div className="rounded-md border border-slate-200 overflow-hidden overflow-x-auto">
                        <table className="w-full text-sm text-left min-w-[600px]">
                            <thead className="bg-slate-50 text-slate-500 font-medium">
                                <tr>
                                    <th className="px-4 py-3">Nome da Área</th>
                                    <th className="px-4 py-3">Capacidade</th>
                                    <th className="px-4 py-3">Taxa (R$)</th>
                                    <th className="px-4 py-3 text-center w-[120px]">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {areas.map(area => (
                                    <tr key={area.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3 font-medium text-slate-900 flex items-center gap-3">
                                            <img src={area.imageUrl || "https://placehold.co/40"} className="w-8 h-8 rounded object-cover bg-slate-200" alt="" />
                                            {area.name}
                                        </td>
                                        <td className="px-4 py-3 text-slate-600">{area.capacity} pessoas</td>
                                        <td className="px-4 py-3 text-slate-600">
                                            {area.fee === 0 ? 'Grátis' : area.fee.toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex justify-center gap-1">
                                                <Button variant="ghost" size="icon" onClick={() => handleOpenAreaModal(area)}>
                                                    <Icons.Edit className="h-4 w-4 text-blue-600" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDeleteArea(area.id)}>
                                                    <Icons.Trash className="h-4 w-4 text-red-600" />
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
         </div>
      )}

      {/* --- VIEW: REQUESTS (Admin) --- */}
      {activeTab === 'REQUESTS' && (
          <Card>
              <CardHeader>
                  <CardTitle>Solicitações Pendentes</CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="space-y-4">
                      {pendingReservations.length === 0 ? (
                          <div className="text-center py-8 text-slate-500">
                              Nenhuma solicitação pendente no momento.
                          </div>
                      ) : (
                          pendingReservations.map(res => (
                              <div key={res.id} className="flex flex-col md:flex-row items-center justify-between p-4 border border-slate-200 rounded-lg bg-slate-50 gap-4">
                                  <div className="flex items-start gap-4">
                                      <div className="p-3 bg-white rounded-full border border-slate-200">
                                          <Icons.Calendar className="h-5 w-5 text-amber-500" />
                                      </div>
                                      <div>
                                          <h4 className="font-semibold text-slate-900">{res.areaName}</h4>
                                          <p className="text-sm text-slate-600">
                                              Data: {new Date(res.date).toLocaleDateString('pt-BR')} - {res.startTime}
                                          </p>
                                          <p className="text-xs text-slate-500">Solicitado por: <strong>{res.userName}</strong></p>
                                      </div>
                                  </div>
                                  <div className="flex gap-2 w-full md:w-auto">
                                      <Button 
                                        variant="ghost" 
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50 flex-1 md:flex-none"
                                        onClick={() => handleApproveReject(res.id, 'REJECTED')}
                                      >
                                          Rejeitar
                                      </Button>
                                      <Button 
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1 md:flex-none"
                                        onClick={() => handleApproveReject(res.id, 'CONFIRMED')}
                                      >
                                          Aprovar
                                      </Button>
                                  </div>
                              </div>
                          ))
                      )}
                  </div>
              </CardContent>
          </Card>
      )}

      {/* --- MODAL: BOOKING --- */}
      <Modal 
        isOpen={isBookModalOpen} 
        onClose={() => setIsBookModalOpen(false)}
        title={`Reservar ${selectedArea?.name}`}
      >
          <form onSubmit={handleBook} className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-100 rounded text-sm text-blue-800">
                  <p><strong>Taxa de Utilização:</strong> {selectedArea?.fee === 0 ? 'Gratuito' : `R$ ${selectedArea?.fee.toFixed(2)}`}</p>
                  <p className="text-xs mt-1 text-blue-600">O valor será lançado na sua próxima fatura condominial.</p>
              </div>

              <div className="space-y-2">
                  <label className="text-sm font-medium">Selecione a Data</label>
                  <input 
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                  />
              </div>

              <div className="space-y-2">
                  <label className="text-sm font-medium">Termo de Uso</label>
                  <div className="h-20 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded text-xs text-slate-500">
                      Declaro estar ciente das normas de utilização do espaço ({selectedArea?.rules}), comprometendo-me a entregá-lo nas mesmas condições de limpeza e conservação.
                  </div>
                  <div className="flex items-center gap-2">
                      <input type="checkbox" required id="terms" className="rounded border-slate-300" />
                      <label htmlFor="terms" className="text-xs text-slate-700">Li e aceito as regras de utilização</label>
                  </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="ghost" onClick={() => setIsBookModalOpen(false)}>Cancelar</Button>
                  <Button type="submit">Confirmar Reserva</Button>
              </div>
          </form>
      </Modal>

      {/* --- MODAL: ADD/EDIT AREA (Admin) --- */}
      <Modal 
        isOpen={isAreaModalOpen} 
        onClose={() => setIsAreaModalOpen(false)}
        title={isEditingArea ? 'Editar Área Comum' : 'Nova Área Comum'}
      >
          <form onSubmit={handleSaveArea} className="space-y-4">
              <div className="space-y-2">
                  <label className="text-sm font-medium">Nome da Área</label>
                  <input 
                      required
                      className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm"
                      placeholder="Ex: Salão de Jogos"
                      value={areaFormData.name}
                      onChange={(e) => setAreaFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                      <label className="text-sm font-medium">Capacidade</label>
                      <input 
                          type="number"
                          required
                          className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm"
                          value={areaFormData.capacity}
                          onChange={(e) => setAreaFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) }))}
                      />
                  </div>
                  <div className="space-y-2">
                      <label className="text-sm font-medium">Taxa de Uso (R$)</label>
                      <input 
                          type="number"
                          step="0.01"
                          required
                          className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm"
                          value={areaFormData.fee}
                          onChange={(e) => setAreaFormData(prev => ({ ...prev, fee: parseFloat(e.target.value) }))}
                      />
                  </div>
              </div>

              <div className="space-y-2">
                  <label className="text-sm font-medium">URL da Imagem</label>
                  <input 
                      className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm"
                      placeholder="https://..."
                      value={areaFormData.imageUrl}
                      onChange={(e) => setAreaFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                  />
              </div>

              <div className="space-y-2">
                  <label className="text-sm font-medium">Descrição</label>
                  <textarea 
                      required
                      className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm"
                      rows={2}
                      value={areaFormData.description}
                      onChange={(e) => setAreaFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
              </div>

              <div className="space-y-2">
                  <label className="text-sm font-medium">Regras de Uso</label>
                  <textarea 
                      required
                      className="flex w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm"
                      rows={2}
                      placeholder="Ex: Limpeza, Horário de Silêncio..."
                      value={areaFormData.rules}
                      onChange={(e) => setAreaFormData(prev => ({ ...prev, rules: e.target.value }))}
                  />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="ghost" onClick={() => setIsAreaModalOpen(false)}>Cancelar</Button>
                  <Button type="submit">Salvar Área</Button>
              </div>
          </form>
      </Modal>
    </div>
  );
};