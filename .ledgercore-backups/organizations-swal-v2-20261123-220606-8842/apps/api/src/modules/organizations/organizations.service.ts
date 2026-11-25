import {
  ConflictException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';

import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';
import { parseOrganizationPayload } from './dto/create-organization.dto.js';

const fields = {
  id: true,
  name: true,
  slug: true,
  defaultCurrency: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  private error(error: unknown): never {
    const code =
      error && typeof error === 'object' && 'code' in error
        ? (error as { code?: unknown }).code
        : undefined;

    if (code === 'P2002') {
      throw new ConflictException('Slug organisasi sudah digunakan.');
    }

    if (code === 'P2025') {
      throw new NotFoundException('Organisasi tidak ditemukan.');
    }

    if (code === 'P2021' || code === 'P2022') {
      throw new ServiceUnavailableException(
        'Tabel Organizations belum siap. Periksa migration.',
      );
    }

    throw error;
  }

  async findAll() {
    try {
      return await this.prisma.organization.findMany({
        select: fields,
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
    } catch (error: unknown) {
      return this.error(error);
    }
  }

  async create(input: unknown) {
    const data = parseOrganizationPayload(input);

    try {
      return await this.prisma.organization.create({
        data,
        select: fields,
      });
    } catch (error: unknown) {
      return this.error(error);
    }
  }

  async update(id: string, input: unknown) {
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)
    ) {
      throw new NotFoundException('ID organisasi tidak valid.');
    }

    const data = parseOrganizationPayload(input);

    try {
      return await this.prisma.organization.update({
        where: { id },
        data,
        select: fields,
      });
    } catch (error: unknown) {
      return this.error(error);
    }
  }
}
