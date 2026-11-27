import {
  Controller,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';

import {
  AuthGuard,
  type AuthenticatedRequest,
} from '../../common/guards/auth.guard.js';

import {
  permissionsForUser,
} from '../../common/access/access.policy.js';

@Controller('auth')
@UseGuards(AuthGuard)
export class AccessController {
  @Get('permissions')
  permissions(@Req() request: AuthenticatedRequest) {
    const user = request.ledgerUser;

    return {
      role: user?.role ?? null,
      roleScope: user?.roleScope ?? null,
      organizationId: user?.organizationId ?? null,
      permissions: permissionsForUser(user),
    };
  }
}
