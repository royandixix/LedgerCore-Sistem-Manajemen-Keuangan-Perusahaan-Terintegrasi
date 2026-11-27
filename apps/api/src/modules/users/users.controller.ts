import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard, type AuthenticatedRequest } from '../../common/guards/auth.guard.js';
import { PermissionsGuard } from '../../common/guards/permissions.guard.js';
import { Roles } from '../../common/decorators/permissions.decorator.js';
import { RequiredPermissions } from '../../common/access/access.decorator.js';
import { UsersService } from './users.service.js';

@RequiredPermissions('users.manage')
@Controller('users')
@UseGuards(AuthGuard, PermissionsGuard)
@Roles('SUPER_ADMIN')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  list() { return this.users.list(); }

  @Get('organizations')
  organizations() { return this.users.organizations(); }

  @Post('invite')
  invite(@Body() input: unknown) { return this.users.invite(input); }

  @Post('memberships')
  addExisting(@Body() input: unknown) { return this.users.addExisting(input); }

  @Patch('memberships/:id')
  changeRole(@Param('id') id: string, @Body() input: unknown, @Req() request: AuthenticatedRequest) {
    return this.users.changeRole(id, input, request.ledgerUser?.id);
  }

  @Delete('memberships/:id')
  remove(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return this.users.remove(id, request.ledgerUser?.id);
  }
}
