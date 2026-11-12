import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';

import { PrismaService } from '../infrastructure/prisma/prisma.service.js';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  getHealth() {
    return {
      service: 'ledgercore-api',
      version: 'v1',
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('database')
  async getDatabaseHealth() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;

      return {
        service: 'ledgercore-database',
        provider: 'postgresql',
        status: 'connected',
      };
    } catch {
      throw new ServiceUnavailableException({
        service: 'ledgercore-database',
        status: 'unavailable',
      });
    }
  }
}
