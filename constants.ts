import { Condo, User, Transaction, Unit, Billing, FinancialSummary, Supplier, MaintenanceTask, CommonArea, Reservation } from './types';

export const MOCK_USER: User = {
  id: 'u1',
  name: 'Carlos Silva',
  email: 'syndico@condofinance.com',
  role: 'ADMIN_CONDOMINIO',
  avatarUrl: 'https://picsum.photos/100/100',
};

export const MOCK_CONDO: Condo = {
  id: 'c1',
  name: 'Residencial Jardins do Sul',
  address: 'Av. Paulista, 1000 - São Paulo, SP',
  cnpj: '12.345.678/0001-90',
  defaultDueDay: 10,
  finePercent: 2.0,
  interestPercent: 1.0,
  attachmentRequiredAbove: 100.00,
};

export const MOCK_UNITS: Unit[] = Array.from({ length: 12 }).map((_, i) => ({
  id: `unit-${i}`,
  condoId: 'c1',
  code: `APT ${101 + i}`,
  block: 'A',
  ownerName: `Proprietário ${i + 1}`,
  fraction: 0.0083,
}));

export const MOCK_SUPPLIERS: Supplier[] = [
  { id: 'sup-1', condoId: 'c1', name: 'Enel Distribuição', document: '00.000.000/0001-00', contact: '0800 7272 120', active: true },
  { id: 'sup-2', condoId: 'c1', name: 'Sabesp', document: '11.111.111/0001-11', contact: '0800 011 9911', active: true },
  { id: 'sup-3', condoId: 'c1', name: 'Atlas Schindler', document: '22.222.222/0001-22', contact: 'sac@atlas.com.br', pixKey: '22222222000122', active: true },
  { id: 'sup-4', condoId: 'c1', name: 'Verde Vida Jardinagem', document: '33.333.333/0001-33', contact: '(11) 99999-9999', pixKey: '33333333000133', active: true },
  { id: 'sup-5', condoId: 'c1', name: 'SegurMax Monitoramento', document: '44.444.444/0001-44', contact: 'comercial@segurmax.com', active: false },
];

export const MOCK_MAINTENANCE: MaintenanceTask[] = [
  {
    id: 'm1',
    condoId: 'c1',
    title: 'Manutenção Mensal Elevadores',
    description: 'Verificação de cabos, óleo e sistema de freios.',
    type: 'PREVENTIVE',
    status: 'COMPLETED',
    priority: 'HIGH',
    scheduledDate: '2023-10-15',
    completedDate: '2023-10-15',
    supplierId: 'sup-3',
    cost: 450.00
  },
  {
    id: 'm2',
    condoId: 'c1',
    title: 'Limpeza da Caixa d\'Água',
    description: 'Higienização semestral obrigatória.',
    type: 'PREVENTIVE',
    status: 'PENDING',
    priority: 'MEDIUM',
    scheduledDate: '2023-11-20',
    supplierId: 'sup-2',
    cost: 1200.00
  },
  {
    id: 'm3',
    condoId: 'c1',
    title: 'Reparo Portão Garagem',
    description: 'Motor travando na abertura.',
    type: 'CORRECTIVE',
    status: 'IN_PROGRESS',
    priority: 'CRITICAL',
    scheduledDate: '2023-11-01',
    supplierId: 'sup-5',
    cost: 850.00
  },
  {
    id: 'm4',
    condoId: 'c1',
    title: 'Poda de Árvores',
    description: 'Poda preventiva antes da época de chuvas.',
    type: 'PREVENTIVE',
    status: 'PENDING',
    priority: 'LOW',
    scheduledDate: '2023-11-15',
    supplierId: 'sup-4',
    cost: 300.00
  }
];

export const MOCK_COMMON_AREAS: CommonArea[] = [
  {
    id: 'area-1',
    name: 'Salão de Festas',
    capacity: 60,
    fee: 250.00,
    imageUrl: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=800',
    description: 'Espaço amplo com cozinha completa, mesas, cadeiras e ar condicionado.',
    rules: 'Silêncio após 22h. Limpeza inclusa na taxa.',
    active: true
  },
  {
    id: 'area-2',
    name: 'Churrasqueira Gourmet',
    capacity: 20,
    fee: 80.00,
    imageUrl: 'https://images.unsplash.com/photo-1555685812-4b943f1cb0eb?auto=format&fit=crop&q=80&w=800',
    description: 'Área externa coberta com churrasqueira, pia e freezer.',
    rules: 'Proibido som automotivo. Entregar limpo.',
    active: true
  },
  {
    id: 'area-3',
    name: 'Espaço Fitness',
    capacity: 10,
    fee: 0.00,
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800',
    description: 'Academia equipada com esteiras, bicicletas e pesos livres.',
    rules: 'Uso máximo de 1h por equipamento se houver fila.',
    active: true
  }
];

export const MOCK_RESERVATIONS: Reservation[] = [
  { 
    id: 'res-1', 
    areaId: 'area-1', 
    areaName: 'Salão de Festas', 
    userId: 'u2', 
    userName: 'Ana Souza', 
    date: '2023-11-20', 
    startTime: '18:00', 
    status: 'CONFIRMED',
    createdAt: '2023-11-01'
  },
  { 
    id: 'res-2', 
    areaId: 'area-2', 
    areaName: 'Churrasqueira Gourmet', 
    userId: MOCK_USER.id, 
    userName: MOCK_USER.name, 
    date: '2023-11-25', 
    startTime: '12:00', 
    status: 'PENDING',
    createdAt: '2023-11-10'
  },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 't1',
    condoId: 'c1',
    type: 'RECEITA',
    description: 'Cota Condominial - APT 101',
    category: 'Taxa Ordinária',
    amount: 850.00,
    competenceDate: '2023-10-01',
    dueDate: '2023-10-10',
    paymentDate: '2023-10-09',
    status: 'PAGO',
  },
  {
    id: 't2',
    condoId: 'c1',
    type: 'DESPESA',
    description: 'Manutenção Elevador',
    category: 'Manutenção',
    amount: 450.00,
    competenceDate: '2023-10-01',
    dueDate: '2023-10-15',
    paymentDate: '2023-10-14',
    status: 'PAGO',
  },
  {
    id: 't3',
    condoId: 'c1',
    type: 'DESPESA',
    description: 'Conta de Energia (Área Comum)',
    category: 'Consumo',
    amount: 1200.50,
    competenceDate: '2023-10-01',
    dueDate: '2023-10-20',
    status: 'PENDENTE_APROVACAO',
  },
  {
    id: 't4',
    condoId: 'c1',
    type: 'RECEITA',
    description: 'Aluguel Salão de Festas',
    category: 'Receita Extra',
    amount: 200.00,
    competenceDate: '2023-10-01',
    dueDate: '2023-10-25',
    status: 'RASCUNHO',
  },
  {
    id: 't5',
    condoId: 'c1',
    type: 'DESPESA',
    description: 'Jardinagem Mensal',
    category: 'Serviços',
    amount: 800.00,
    competenceDate: '2023-10-01',
    dueDate: '2023-10-05',
    paymentDate: '2023-10-05',
    status: 'PAGO',
  }
];

export const MOCK_BILLINGS: Billing[] = [
  { id: 'b1', condoId: 'c1', unitId: 'unit-0', unitCode: 'APT 101', competenceDate: '2023-11-01', amount: 850.00, status: 'ABERTA', dueDate: '2023-11-10' },
  { id: 'b2', condoId: 'c1', unitId: 'unit-1', unitCode: 'APT 102', competenceDate: '2023-10-01', amount: 850.00, status: 'ATRASADA', dueDate: '2023-10-10' },
  { id: 'b3', condoId: 'c1', unitId: 'unit-2', unitCode: 'APT 103', competenceDate: '2023-11-01', amount: 850.00, status: 'PAGA', dueDate: '2023-11-10' },
];

export const MOCK_SUMMARY: FinancialSummary = {
  revenue: 25400.00,
  expenses: 18200.00,
  balance: 7200.00,
  delinquencyRate: 12.5,
  history: [
    { month: 'Mai', revenue: 22000, expenses: 18000 },
    { month: 'Jun', revenue: 23000, expenses: 19500 },
    { month: 'Jul', revenue: 21500, expenses: 17000 },
    { month: 'Ago', revenue: 24000, expenses: 20000 },
    { month: 'Set', revenue: 25000, expenses: 18500 },
    { month: 'Out', revenue: 25400, expenses: 18200 },
  ]
};