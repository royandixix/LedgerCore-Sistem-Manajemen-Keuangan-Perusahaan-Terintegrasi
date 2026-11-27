import type {
  LedgerUser,
  RoleCode,
} from '../../modules/auth/auth.service.js';

export const ALL_PERMISSIONS = [
  'workspace.read',
  'organizations.read',
  'organizations.manage',
  'users.read',
  'users.manage',
  'roles.read',
  'roles.manage',
  'accounts.read',
  'accounts.manage',
  'journals.read',
  'journals.manage',
  'journals.post',
  'expenses.read',
  'expenses.manage',
  'expenses.approve',
  'payables.read',
  'payables.manage',
  'receivables.read',
  'receivables.manage',
  'reports.read',
  'audit.read',
] as const;

export type PermissionCode =
  (typeof ALL_PERMISSIONS)[number];

type MemberRole = Exclude<RoleCode, 'SUPER_ADMIN'>;

const BASE = [
  'workspace.read',
  'organizations.read',
] as const;

export const ORGANIZATION_PERMISSIONS:
  Record<MemberRole, readonly PermissionCode[]> = {
  FINANCE_ADMIN: [
    ...BASE,
    'users.read', 'roles.read',
    'accounts.read', 'accounts.manage',
    'journals.read', 'journals.manage',
    'expenses.read', 'expenses.manage',
    'payables.read', 'payables.manage',
    'receivables.read', 'receivables.manage',
    'reports.read',
  ],
  ACCOUNTANT: [
    ...BASE,
    'accounts.read',
    'journals.read', 'journals.manage',
    'expenses.read', 'payables.read',
    'receivables.read', 'reports.read',
  ],
  FINANCE_MANAGER: [
    ...BASE,
    'accounts.read',
    'journals.read', 'journals.post',
    'expenses.read', 'expenses.approve',
    'payables.read', 'receivables.read',
    'reports.read',
  ],
  AP_OFFICER: [
    ...BASE,
    'accounts.read', 'expenses.read',
    'payables.read', 'payables.manage',
    'reports.read',
  ],
  AR_OFFICER: [
    ...BASE,
    'accounts.read',
    'receivables.read', 'receivables.manage',
    'reports.read',
  ],
  AUDITOR: [
    ...BASE,
    'users.read', 'roles.read',
    'accounts.read', 'journals.read',
    'expenses.read', 'payables.read',
    'receivables.read', 'reports.read',
    'audit.read',
  ],
};

// UUID benar: 8-4-4-4-12.
const UUID =
  /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;

export function hasPermission(
  user: LedgerUser | undefined,
  permission: PermissionCode,
  organizationId?: string,
): boolean {
  if (!user?.role) return false;

  if (
    organizationId !== undefined &&
    !UUID.test(organizationId)
  ) return false;

  if (user.role === 'SUPER_ADMIN') {
    return (
      user.roleScope === 'global' &&
      user.organizationId === null
    );
  }

  if (
    user.roleScope !== 'organization' ||
    !user.organizationId ||
    !UUID.test(user.organizationId)
  ) return false;

  if (
    organizationId !== undefined &&
    organizationId.toLowerCase() !==
      user.organizationId.toLowerCase()
  ) return false;

  return ORGANIZATION_PERMISSIONS[user.role]
    ?.includes(permission) ?? false;
}

export function permissionsForUser(
  user: LedgerUser | undefined,
): PermissionCode[] {
  return ALL_PERMISSIONS.filter(
    (permission) =>
      hasPermission(
        user,
        permission,
        user?.organizationId ?? undefined,
      ),
  );
}
