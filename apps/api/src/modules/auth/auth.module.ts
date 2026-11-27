import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module.js';
import { AuthController } from './auth.controller.js';
import { AccessController } from './access.controller.js';
import { RoleCatalogController } from './role-catalog.controller.js';
import { AuthService } from './auth.service.js';
import { AuthGuard } from '../../common/guards/auth.guard.js';
import { PermissionsGuard } from '../../common/guards/permissions.guard.js';

@Module({
  imports: [PrismaModule],
  controllers: [AuthController, AccessController, RoleCatalogController],
  providers: [AuthService, AuthGuard, PermissionsGuard],
  exports: [AuthService, AuthGuard, PermissionsGuard],
})
export class AuthModule {}
