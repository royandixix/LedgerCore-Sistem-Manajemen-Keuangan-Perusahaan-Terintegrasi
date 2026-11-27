import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { Roles } from '../../common/decorators/permissions.decorator.js';
import { RequiredPermissions } from '../../common/access/access.decorator.js';
import { AuthGuard } from '../../common/guards/auth.guard.js';
import { PermissionsGuard } from '../../common/guards/permissions.guard.js';
import { OrganizationsService } from './organizations.service.js';

@RequiredPermissions('organizations.manage')
@Controller('organizations')
@UseGuards(AuthGuard, PermissionsGuard)
export class OrganizationsController {
  constructor(
    private readonly organizations: OrganizationsService,
  ) {}

  @Get()
  @Roles('SUPER_ADMIN')
  findAll() {
    return this.organizations.findAll();
  }

  @Post()
  @Roles('SUPER_ADMIN')
  create(@Body() body: unknown) {
    return this.organizations.create(body);
  }

  @Patch(':id')
  @Roles('SUPER_ADMIN')
  update(
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    return this.organizations.update(id, body);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN')
  remove(@Param('id') id: string) {
    return this.organizations.remove(id);
  }

}
