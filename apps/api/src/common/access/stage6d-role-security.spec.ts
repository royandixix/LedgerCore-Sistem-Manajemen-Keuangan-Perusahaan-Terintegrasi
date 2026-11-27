import { describe, expect, it } from 'vitest';
import type {
  LedgerUser,
  RoleCode,
} from '../../modules/auth/auth.service.js';

import {
  ALL_PERMISSIONS,
  hasPermission,
  permissionsForUser,
  type PermissionCode,
} from './access.policy.js';

const OWN_ORG =
  '11111111-1111-4111-8111-111111111111';

const OTHER_ORG =
  '22222222-2222-4222-8222-222222222222';

type MemberRole = Exclude<RoleCode, 'SUPER_ADMIN'>;

// Ekspektasi independen dari object policy yang diuji.
const expected: Record<
  MemberRole,
  readonly PermissionCode[]
> = {
  FINANCE_ADMIN: [
    'workspace.read',
    'organizations.read',
    'users.read',
    'roles.read',
    'accounts.read',
    'accounts.manage',
    'journals.read',
    'journals.manage',
    'expenses.read',
    'expenses.manage',
    'payables.read',
    'payables.manage',
    'receivables.read',
    'receivables.manage',
    'reports.read',
  ],

  ACCOUNTANT: [
    'workspace.read',
    'organizations.read',
    'accounts.read',
    'journals.read',
    'journals.manage',
    'expenses.read',
    'payables.read',
    'receivables.read',
    'reports.read',
  ],

  FINANCE_MANAGER: [
    'workspace.read',
    'organizations.read',
    'accounts.read',
    'journals.read',
    'journals.post',
    'expenses.read',
    'expenses.approve',
    'payables.read',
    'receivables.read',
    'reports.read',
  ],

  AP_OFFICER: [
    'workspace.read',
    'organizations.read',
    'accounts.read',
    'expenses.read',
    'payables.read',
    'payables.manage',
    'reports.read',
  ],

  AR_OFFICER: [
    'workspace.read',
    'organizations.read',
    'accounts.read',
    'receivables.read',
    'receivables.manage',
    'reports.read',
  ],

  AUDITOR: [
    'workspace.read',
    'organizations.read',
    'users.read',
    'roles.read',
    'accounts.read',
    'journals.read',
    'expenses.read',
    'payables.read',
    'receivables.read',
    'reports.read',
    'audit.read',
  ],
};

function member(role: MemberRole): LedgerUser {
  return {
    id: 'test-user',
    email: null,
    name: null,
    role,
    roleScope: 'organization',
    organizationId: OWN_ORG,
  };
}

describe.each(
  Object.entries(expected) as [
    MemberRole,
    readonly PermissionCode[]
  ][]
)('Stage 6D - %s', (role, granted) => {
  const user = member(role);

  it.each(ALL_PERMISSIONS)(
    'izin %s sesuai matriks',
    (permission) => {
      expect(
        hasPermission(user, permission, OWN_ORG)
      ).toBe(granted.includes(permission));
    }
  );

  it('menolak seluruh izin untuk organisasi lain', () => {
    for (const permission of ALL_PERMISSIONS) {
      expect(
        hasPermission(user, permission, OTHER_ORG)
      ).toBe(false);
    }
  });

  it('menolak jika organisasi tidak ada', () => {
    expect(
      permissionsForUser({
        ...user,
        organizationId: null,
      })
    ).toEqual([]);
  });

  it('menolak scope global palsu', () => {
    expect(
      permissionsForUser({
        ...user,
        roleScope: 'global',
      })
    ).toEqual([]);
  });

  it('izin yang ditampilkan sesuai matriks', () => {
    expect(
      permissionsForUser(user)
    ).toEqual(
      ALL_PERMISSIONS.filter(
        (p) => granted.includes(p)
      )
    );
  });
});

describe('Stage 6D - SUPER_ADMIN', () => {
  const admin: LedgerUser = {
    id: 'test-super-admin',
    email: null,
    name: null,
    role: 'SUPER_ADMIN',
    roleScope: 'global',
    organizationId: null,
  };

  it.each(ALL_PERMISSIONS)(
    'Super Admin global dapat %s',
    (permission) => {
      expect(
        hasPermission(admin, permission)
      ).toBe(true);
    }
  );

  it('menolak SUPER_ADMIN scope organisasi', () => {
    expect(
      permissionsForUser({
        ...admin,
        roleScope: 'organization',
        organizationId: OWN_ORG,
      })
    ).toEqual([]);
  });

  it('tanpa role tidak memiliki izin', () => {
    expect(
      permissionsForUser({
        ...admin,
        role: null,
        roleScope: null,
      })
    ).toEqual([]);
  });

  it('menolak UUID organisasi tidak valid', () => {
    expect(
      hasPermission(
        member('ACCOUNTANT'),
        'journals.read',
        'invalid'
      )
    ).toBe(false);
  });
});
