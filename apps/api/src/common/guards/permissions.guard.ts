import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/permissions.decorator.js';
import {
  REQUIRED_PERMISSIONS_KEY,
  ORGANIZATION_PARAM_KEY,
} from '../access/access.decorator.js';
import { hasPermission, type PermissionCode } from '../access/access.policy.js';
import type { RoleCode } from '../../modules/auth/auth.service.js';
import type { AuthenticatedRequest } from './auth.guard.js';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const allowedRoles = this.reflector.getAllAndOverride<RoleCode[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const role = request.ledgerUser?.role;

    const required = this.reflector.getAllAndOverride<PermissionCode[]>(
      REQUIRED_PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (
      !role ||
      (allowedRoles?.length ? !allowedRoles.includes(role) : !required?.length)
    ) {
      throw new ForbiddenException(
        'Anda tidak memiliki hak akses ke fitur ini.',
      );
    }

    if (required?.length) {
      const paramKey = this.reflector.getAllAndOverride<string>(
        ORGANIZATION_PARAM_KEY,
        [context.getHandler(), context.getClass()],
      );

      const organizationId = paramKey ? request.params?.[paramKey] : undefined;

      if (paramKey && (typeof organizationId !== 'string' || !organizationId)) {
        throw new ForbiddenException('Konteks organisasi tidak valid.');
      }

      if (
        role !== 'SUPER_ADMIN' &&
        !paramKey &&
        required.some((p) => p !== 'workspace.read')
      ) {
        throw new ForbiddenException('Endpoint belum mengikat organisasi.');
      }

      const allowed = required.every((permission) =>
        hasPermission(
          request.ledgerUser,
          permission,
          typeof organizationId === 'string' ? organizationId : undefined,
        ),
      );

      if (!allowed) {
        throw new ForbiddenException('Izin atau organisasi tidak sesuai.');
      }
    }

    return true;
  }
}
