import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard.js';
import { PermissionsGuard } from '../../common/guards/permissions.guard.js';
import { Roles } from '../../common/decorators/permissions.decorator.js';
import { RequiredPermissions } from '../../common/access/access.decorator.js';
import {
  ALL_PERMISSIONS,
  ORGANIZATION_PERMISSIONS,
} from '../../common/access/access.policy.js';
import type { RoleCode } from './auth.service.js';

const ROLE_LABELS = {
  SUPER_ADMIN: 'Super Administrator',
  FINANCE_ADMIN: 'Finance Admin',
  ACCOUNTANT: 'Accountant',
  FINANCE_MANAGER: 'Finance Manager',
  AP_OFFICER: 'AP Officer',
  AR_OFFICER: 'AR Officer',
  AUDITOR: 'Auditor',
} satisfies Record<RoleCode, string>;

const ROLE_CODES = [
  'SUPER_ADMIN',
  'FINANCE_ADMIN',
  'ACCOUNTANT',
  'FINANCE_MANAGER',
  'AP_OFFICER',
  'AR_OFFICER',
  'AUDITOR',
] as const satisfies readonly RoleCode[];

export function buildRoleCatalog() {
  return {
    version: 'stage6c-v1' as const,
    readOnly: true as const,
    permissions: [...ALL_PERMISSIONS],
    roles: ROLE_CODES.map((code) => ({
      code,
      label: ROLE_LABELS[code],
      scope: code === 'SUPER_ADMIN'
        ? 'global' as const
        : 'organization' as const,
      permissions: code === 'SUPER_ADMIN'
        ? [...ALL_PERMISSIONS]
        : [...ORGANIZATION_PERMISSIONS[code]],
    })),
  };
}

@Controller('auth')
@UseGuards(AuthGuard, PermissionsGuard)
@Roles('SUPER_ADMIN')
@RequiredPermissions('roles.read')
export class RoleCatalogController {
  @Get('permissions/catalog')
  catalog() {
    return buildRoleCatalog();
  }
}
