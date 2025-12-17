
import { UserRole } from '../types';

export type ModuleId = 
  | 'dashboard'
  | 'transactions'
  | 'billings'
  | 'units'
  | 'maintenance'
  | 'suppliers'
  | 'reports'
  | 'settings';

type PermissionMatrix = Record<ModuleId, UserRole[]>;

// Defines which roles can ACCESS a route/module
const MODULE_ACCESS: PermissionMatrix = {
  dashboard: ['MASTER', 'ADMIN_CONDOMINIO', 'FINANCEIRO', 'CONSELHO', 'MORADOR'],
  transactions: ['MASTER', 'ADMIN_CONDOMINIO', 'FINANCEIRO', 'CONSELHO'],
  billings: ['MASTER', 'ADMIN_CONDOMINIO', 'FINANCEIRO', 'CONSELHO', 'MORADOR'], // Morador sees only own bills
  units: ['MASTER', 'ADMIN_CONDOMINIO', 'FINANCEIRO', 'CONSELHO'],
  maintenance: ['MASTER', 'ADMIN_CONDOMINIO', 'FINANCEIRO', 'CONSELHO'],
  suppliers: ['MASTER', 'ADMIN_CONDOMINIO', 'FINANCEIRO'],
  reports: ['MASTER', 'ADMIN_CONDOMINIO', 'FINANCEIRO', 'CONSELHO'],
  settings: ['MASTER', 'ADMIN_CONDOMINIO'],
};

export const canAccess = (role: UserRole, module: ModuleId): boolean => {
  const allowedRoles = MODULE_ACCESS[module];
  return allowedRoles ? allowedRoles.includes(role) : false;
};

export const isFinancialRole = (role: UserRole): boolean => {
    return ['MASTER', 'ADMIN_CONDOMINIO', 'FINANCEIRO'].includes(role);
};

export const isAuditRole = (role: UserRole): boolean => {
    return ['CONSELHO'].includes(role);
};