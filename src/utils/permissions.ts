export type AdminRole =
  | 'SUPER_ADMIN'
  | 'BUSINESS_ADMIN'
  | 'OPS_MANAGER'
  | 'CS_AGENT'
  | 'COMPLIANCE_OFFICER'
  | 'MARKETING_MANAGER';

export type Permission =
  | 'dashboard.view'
  | 'users.view'
  | 'users.edit'
  | 'users.export'
  | 'transactions.view'
  | 'transactions.export'
  | 'kyc.view'
  | 'kyc.approve'
  | 'analytics.view'
  | 'analytics.export'
  | 'settings.view'
  | 'admin.manage';

const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  SUPER_ADMIN: [
    'dashboard.view', 'users.view', 'users.edit', 'users.export',
    'transactions.view', 'transactions.export',
    'kyc.view', 'kyc.approve',
    'analytics.view', 'analytics.export',
    'settings.view', 'admin.manage',
  ],
  BUSINESS_ADMIN: [
    'dashboard.view', 'users.view',
    'transactions.view',
    'analytics.view', 'analytics.export',
  ],
  OPS_MANAGER: [
    'dashboard.view', 'users.view', 'users.edit', 'users.export',
    'transactions.view', 'transactions.export',
    'kyc.view', 'kyc.approve',
  ],
  CS_AGENT: [
    'dashboard.view', 'users.view',
    'transactions.view',
  ],
  COMPLIANCE_OFFICER: [
    'dashboard.view',
    'transactions.view',
    'kyc.view', 'kyc.approve',
  ],
  MARKETING_MANAGER: [
    'dashboard.view',
    'analytics.view',
  ],
};

export function getPermissionsForRole(role: AdminRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

export function hasPermission(role: AdminRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function shouldMaskPII(role: AdminRole): boolean {
  return role === 'CS_AGENT' || role === 'MARKETING_MANAGER';
}

export const ROLE_LABELS: Record<AdminRole, string> = {
  SUPER_ADMIN: 'Super Admin',
  BUSINESS_ADMIN: 'Business Admin',
  OPS_MANAGER: 'Operations Manager',
  CS_AGENT: 'Customer Support',
  COMPLIANCE_OFFICER: 'Compliance Officer',
  MARKETING_MANAGER: 'Marketing Manager',
};

export const ROLE_COLORS: Record<AdminRole, string> = {
  SUPER_ADMIN: '#002E6E',
  BUSINESS_ADMIN: '#00B9F1',
  OPS_MANAGER: '#12B76A',
  CS_AGENT: '#F79009',
  COMPLIANCE_OFFICER: '#7C3AED',
  MARKETING_MANAGER: '#EC4899',
};
