
export type UserRole = 'MASTER' | 'ADMIN_CONDOMINIO' | 'FINANCEIRO' | 'CONSELHO' | 'MORADOR';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface Condo {
  id: string;
  name: string;
  address: string;
  cnpj?: string;
  // Settings / Parameters
  defaultDueDay: number;
  finePercent: number; // Multa %
  interestPercent: number; // Juros %
  attachmentRequiredAbove: number; // Valor acima do qual exige anexo
}

export type TransactionType = 'RECEITA' | 'DESPESA';
export type TransactionStatus = 'RASCUNHO' | 'PENDENTE_APROVACAO' | 'APROVADO' | 'PAGO' | 'CANCELADO';

export interface Transaction {
  id: string;
  condoId: string;
  type: TransactionType;
  description: string;
  category: string;
  amount: number;
  competenceDate: string; // ISO Date YYYY-MM-DD
  dueDate: string;
  paymentDate?: string;
  status: TransactionStatus;
  attachmentUrl?: string;
}

export interface Unit {
  id: string;
  condoId: string;
  code: string; // e.g., "APT 101"
  block?: string;
  ownerName: string;
  fraction: number; // Fração ideal
}

export interface Billing {
  id: string;
  condoId: string;
  unitId: string;
  unitCode: string;
  competenceDate: string;
  amount: number;
  status: 'ABERTA' | 'PAGA' | 'ATRASADA' | 'NEGOCIADA';
  dueDate: string;
}

export interface FinancialSummary {
  revenue: number;
  expenses: number;
  balance: number;
  delinquencyRate: number; // Percentage
  history: { month: string; revenue: number; expenses: number }[];
}

export interface Supplier {
  id: string;
  condoId: string;
  name: string;
  document: string; // CNPJ or CPF
  contact: string; // Email or Phone
  pixKey?: string;
  active: boolean;
}

export type MaintenanceType = 'PREVENTIVE' | 'CORRECTIVE';
export type MaintenanceStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type MaintenancePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface MaintenanceTask {
  id: string;
  condoId: string;
  title: string;
  description: string;
  type: MaintenanceType;
  status: MaintenanceStatus;
  priority: MaintenancePriority;
  scheduledDate: string; // YYYY-MM-DD
  completedDate?: string;
  supplierId?: string; // Optional link to supplier
  cost?: number; // Estimated or Real cost
}

export interface CommonArea {
  id: string;
  name: string;
  capacity: number;
  fee: number;
  imageUrl: string;
  description: string;
  rules: string;
  active: boolean;
}

export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED';

export interface Reservation {
  id: string;
  areaId: string;
  areaName: string; // Denormalized for easier display
  userId: string;
  userName: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime?: string;
  status: ReservationStatus;
  createdAt: string;
}