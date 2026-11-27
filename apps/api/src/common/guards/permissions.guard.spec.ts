import { describe, expect, it } from 'vitest';
import {
  ForbiddenException,
  type ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import type {
  LedgerUser,
} from '../../modules/auth/auth.service.js';

import {
  REQUIRED_PERMISSIONS_KEY,
  ORGANIZATION_PARAM_KEY,
} from '../access/access.decorator.js';

import {
  ROLES_KEY,
} from '../decorators/permissions.decorator.js';

import { PermissionsGuard } from './permissions.guard.js';

const org =
  '11111111-1111-4111-8111-111111111111';

const other =
  '22222222-2222-4222-8222-222222222222';

const user: LedgerUser = {
  id: 'test',
  email: null,
  name: null,
  role: 'ACCOUNTANT',
  roleScope: 'organization',
  organizationId: org,
};

function check(
  target: string | undefined,
  permission = 'journals.manage',
) {
  const reflector = {
    getAllAndOverride(key: string) {
      if (key === ROLES_KEY) return ['ACCOUNTANT'];
      if (key === REQUIRED_PERMISSIONS_KEY) {
        return [permission];
      }
      if (key === ORGANIZATION_PARAM_KEY) {
        return 'organizationId';
      }
      return undefined;
    },
  } as unknown as Reflector;

  const context = {
    getHandler: () => function handler() {},
    getClass: () => class Controller {},
    switchToHttp: () => ({
      getRequest: () => ({
        ledgerUser: user,
        params: target
          ? { organizationId: target }
          : {},
      }),
    }),
  } as unknown as ExecutionContext;

  return new PermissionsGuard(reflector)
    .canActivate(context);
}

describe('Stage 6B PermissionsGuard', () => {
  it('menerima organisasi sendiri', () => {
    expect(check(org)).toBe(true);
  });

  it('menolak organisasi lain', () => {
    expect(() => check(other))
      .toThrow(ForbiddenException);
  });

  it('menolak tanpa ID organisasi', () => {
    expect(() => check(undefined))
      .toThrow(ForbiddenException);
  });

  it('menolak permission yang tidak dimiliki', () => {
    expect(() => check(org, 'expenses.approve'))
      .toThrow(ForbiddenException);
  });
});
