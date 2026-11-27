import { describe, expect, it } from 'vitest';
import type {
  LedgerUser,
} from '../../modules/auth/auth.service.js';

import {
  hasPermission,
  permissionsForUser,
} from './access.policy.js';

const org =
  '11111111-1111-4111-8111-111111111111';

const other =
  '22222222-2222-4222-8222-222222222222';

const accountant: LedgerUser = {
  id: 'test-accountant',
  email: null,
  name: null,
  role: 'ACCOUNTANT',
  organizationId: org,
  roleScope: 'organization',
};

describe('Stage 6B Access Policy', () => {
  it('menerima Accountant pada organisasi sendiri', () => {
    expect(
      hasPermission(accountant, 'journals.manage', org)
    ).toBe(true);
  });

  it('menolak Accountant menyetujui expenses', () => {
    expect(
      hasPermission(accountant, 'expenses.approve', org)
    ).toBe(false);
  });

  it('menolak akses organisasi lain', () => {
    expect(
      hasPermission(accountant, 'journals.manage', other)
    ).toBe(false);
  });

  it('menolak UUID tidak valid', () => {
    expect(
      hasPermission(accountant, 'journals.manage', 'invalid')
    ).toBe(false);
  });

  it('menolak organisasi kosong', () => {
    expect(
      hasPermission({
        ...accountant,
        organizationId: null,
      }, 'journals.manage', org)
    ).toBe(false);
  });

  it('mengizinkan Auditor membaca audit', () => {
    expect(
      hasPermission({
        ...accountant,
        role: 'AUDITOR',
      }, 'audit.read', org)
    ).toBe(true);
  });

  it('Auditor tidak dapat mengubah jurnal', () => {
    expect(
      hasPermission({
        ...accountant,
        role: 'AUDITOR',
      }, 'journals.manage', org)
    ).toBe(false);
  });

  it('Finance Manager bisa approve', () => {
    expect(
      hasPermission({
        ...accountant,
        role: 'FINANCE_MANAGER',
      }, 'expenses.approve', org)
    ).toBe(true);
  });

  it('Super Admin global diizinkan', () => {
    expect(
      hasPermission({
        ...accountant,
        role: 'SUPER_ADMIN',
        roleScope: 'global',
        organizationId: null,
      }, 'users.manage')
    ).toBe(true);
  });

  it('Super Admin palsu ditolak', () => {
    expect(
      hasPermission({
        ...accountant,
        role: 'SUPER_ADMIN',
      }, 'users.manage', org)
    ).toBe(false);
  });

  it('Pengguna tanpa role tidak punya izin', () => {
    expect(
      permissionsForUser({
        ...accountant,
        role: null,
        roleScope: null,
      })
    ).toEqual([]);
  });
});
