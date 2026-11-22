import { SetMetadata } from '@nestjs/common';
import type { RoleCode } from '../../modules/auth/auth.service.js';

export const ROLES_KEY = 'ledgercore_roles';

export const Roles = (...roles: RoleCode[]) => SetMetadata(ROLES_KEY, roles);
