import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService, type LedgerUser } from '../../modules/auth/auth.service.js';

export interface AuthenticatedRequest extends Request {
  ledgerUser?: LedgerUser;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const authorization = request.headers.authorization;

    const match = authorization?.match(/^Bearer\s+(.+)$/i);

    if (!match?.[1]) {
      throw new UnauthorizedException('Token autentikasi tidak ditemukan.');
    }

    request.ledgerUser = await this.authService.authenticate(match[1].trim());

    return true;
  }
}
