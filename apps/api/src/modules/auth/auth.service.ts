import {
  Injectable,
  UnauthorizedException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';

export type RoleCode =
  | 'SUPER_ADMIN'
  | 'FINANCE_ADMIN'
  | 'ACCOUNTANT'
  | 'FINANCE_MANAGER'
  | 'AP_OFFICER'
  | 'AR_OFFICER'
  | 'AUDITOR';

export interface LedgerUser {
  id: string;
  email: string | null;
  name: string | null;
  role: RoleCode | null;
  organizationId: string | null;
  roleScope: 'global' | 'organization' | null;
}

@Injectable()
export class AuthService {
  private readonly supabase: SupabaseClient;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    const url = this.config.get<string>('SUPABASE_URL');
    const key = this.config.get<string>('SUPABASE_PUBLISHABLE_KEY');

    if (!url || !key || key === 'ISI_PUBLISHABLE_KEY_ASLI') {
      throw new Error('Konfigurasi Supabase Auth belum lengkap.');
    }

    this.supabase = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
  }

  async authenticate(accessToken: string): Promise<LedgerUser> {
    const { data, error } = await this.supabase.auth.getUser(accessToken);

    if (error && error.status && error.status >= 500) {
      throw new ServiceUnavailableException(
        'Layanan autentikasi tidak tersedia.',
      );
    }

    if (error || !data.user) {
      throw new UnauthorizedException('Sesi tidak valid atau telah berakhir.');
    }

    const roles = await this.prisma.$queryRaw<Array<{ role: RoleCode }>>`
      SELECT role
      FROM ledgercore_security.user_roles
      WHERE user_id = CAST(${data.user.id} AS UUID)
        AND is_active = TRUE
      LIMIT 1
    `;

    // LEDGERCORE STAGE 6A ROLE RESOLUTION
    // Global role aktif tetap memiliki prioritas.
    const globalRole = roles[0]?.role ?? null;

    // Jangan memulihkan akses akun yang global role-nya
    // sengaja dinonaktifkan.
    const disabledGlobal = globalRole
      ? false
      : (
          await this.prisma.$queryRaw<Array<{ disabled: boolean }>>`
            SELECT EXISTS (
              SELECT 1
              FROM ledgercore_security.user_roles
              WHERE user_id = CAST(${data.user.id} AS UUID)
                AND is_active = FALSE
            ) AS disabled
          `
        )[0]?.disabled ?? false;

    // Membership tidak pernah dapat memberikan SUPER_ADMIN.
    // Ambil maksimal dua untuk mendeteksi ambiguitas.
    const membershipCandidates = !globalRole && !disabledGlobal
      ? await this.prisma.organizationMember.findMany({
          where: {
            authUserId: data.user.id,
            role: { not: 'SUPER_ADMIN' },
          },
          select: {
            organizationId: true,
            role: true,
          },
          orderBy: [
            { createdAt: 'asc' },
            { id: 'asc' },
          ],
          take: 2,
        })
      : [];

    // Fail closed apabila lebih dari satu organisasi.
    const membership = membershipCandidates.length === 1
      ? membershipCandidates[0]
      : null;

    const resolvedRole: RoleCode | null =
      globalRole ?? membership?.role ?? null;

    const organizationId: string | null = globalRole
      ? null
      : membership?.organizationId ?? null;

    const roleScope: LedgerUser['roleScope'] = globalRole
      ? 'global'
      : membership
        ? 'organization'
        : null;

    const fullName = data.user.user_metadata?.full_name;

    return {
      id: data.user.id,
      email: data.user.email ?? null,
      name: typeof fullName === 'string' ? fullName : null,
      role: resolvedRole,
      organizationId,
      roleScope,
    };
  }
}
