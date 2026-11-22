import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/permissions.decorator.js';
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

    if (!role || !allowedRoles?.length || !allowedRoles.includes(role)) {
      throw new ForbiddenException(
        'Anda tidak memiliki hak akses ke fitur ini.',
      );
    }

    return true;
  }
}
