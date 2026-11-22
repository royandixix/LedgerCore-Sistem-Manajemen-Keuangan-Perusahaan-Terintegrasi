import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard.js';
import type { AuthenticatedRequest } from '../../common/guards/auth.guard.js';
import { PermissionsGuard } from '../../common/guards/permissions.guard.js';
import { Roles } from '../../common/decorators/permissions.decorator.js';

@Controller('auth')
export class AuthController {
  @Get('me')
  @UseGuards(AuthGuard)
  getProfile(@Req() request: AuthenticatedRequest) {
    return request.ledgerUser;
  }

  @Get('admin-check')
  @Roles('SUPER_ADMIN')
  @UseGuards(AuthGuard, PermissionsGuard)
  checkSuperAdmin() {
    return {
      status: 'authorized',
      role: 'SUPER_ADMIN',
      message: 'Akses Super Admin berhasil diverifikasi.',
    };
  }

  @Get('dashboard-access')
  @Roles(
    'SUPER_ADMIN',
    'FINANCE_ADMIN',
    'ACCOUNTANT',
    'FINANCE_MANAGER',
    'AP_OFFICER',
    'AR_OFFICER',
    'AUDITOR',
  )
  @UseGuards(AuthGuard, PermissionsGuard)
  getDashboardAccess(@Req() request: AuthenticatedRequest) {
    return {
      status: 'authorized',
      user: request.ledgerUser,
    };
  }
}
