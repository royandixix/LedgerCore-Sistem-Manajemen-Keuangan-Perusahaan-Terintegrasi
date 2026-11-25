import {
  BadRequestException, ConflictException, ForbiddenException,
  Injectable, NotFoundException, ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { PrismaService } from '../../infrastructure/prisma/prisma.service.js';

const ALLOWED_ROLES = [
  'FINANCE_ADMIN', 'ACCOUNTANT', 'FINANCE_MANAGER',
  'AP_OFFICER', 'AR_OFFICER', 'AUDITOR',
] as const;
type MemberRole = (typeof ALLOWED_ROLES)[number];

function fields(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new BadRequestException('Form tidak valid.');
  }
  return input as Record<string, unknown>;
}
function uuid(value: unknown, field = 'ID'): string {
  if (typeof value !== 'string' ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
    throw new BadRequestException(`${field} tidak valid.`);
  }
  return value;
}
function role(value: unknown): MemberRole {
  if (typeof value !== 'string' || !ALLOWED_ROLES.some((item) => item === value)) {
    throw new BadRequestException('Role tidak diizinkan. SUPER_ADMIN hanya diatur melalui prosedur terpisah.');
  }
  return value as MemberRole;
}
function codeOf(error: unknown): string | undefined {
  return error && typeof error === 'object' && 'code' in error
    ? String((error as { code: unknown }).code)
    : undefined;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService, private readonly config: ConfigService) {}

  private admin(): SupabaseClient {
    const url = this.config.get<string>('SUPABASE_URL');
    const key = this.config.get<string>('SUPABASE_SECRET_KEY');
    if (!url || !key || !(key.startsWith('sb_secret_') || key.startsWith('eyJ'))) {
      throw new ServiceUnavailableException(
        'Undangan pengguna belum dikonfigurasi. Set SUPABASE_SECRET_KEY di apps/api/.env menggunakan key BARU yang sudah dirotasi.',
      );
    }
    return createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
  }

  async organizations() {
    return this.prisma.organization.findMany({
      select: { id: true, name: true, slug: true },
      orderBy: { name: 'asc' }, take: 200,
    });
  }

  async list() {
    const memberships = await this.prisma.organizationMember.findMany({
      include: { organization: { select: { id: true, name: true, slug: true } } },
      orderBy: { createdAt: 'desc' }, take: 100,
    });
    const admin = this.admin();
    const users = new Map<string, { email: string; name: string; banned: boolean }>();
    const ids = [...new Set(memberships.map((member) => member.authUserId))];
    // Batasi paralelisme terhadap Supabase Auth Admin API.
    for (let i = 0; i < ids.length; i += 5) {
      await Promise.all(ids.slice(i, i + 5).map(async (id) => {
        const { data, error } = await admin.auth.admin.getUserById(id);
        if (error || !data.user) {
          users.set(id, { email: 'Akun tidak ditemukan', name: '', banned: false });
          return;
        }
        const metadata = data.user.user_metadata?.full_name;
        const bannedUntil = data.user.banned_until;
        users.set(id, {
          email: data.user.email ?? 'Tanpa email',
          name: typeof metadata === 'string' ? metadata : '',
          banned: Boolean(bannedUntil && new Date(bannedUntil).getTime() > Date.now()),
        });
      }));
    }
    const protectedIds = await this.prisma.$queryRaw<Array<{ user_id: string }>>`
      SELECT user_id::text AS user_id
      FROM ledgercore_security.user_roles
      WHERE role = 'SUPER_ADMIN' AND is_active = TRUE
    `;
    const protectedSet = new Set(protectedIds.map((item) => item.user_id));
    return memberships.map((member) => ({
      id: member.id,
      authUserId: member.authUserId,
      role: member.role,
      createdAt: member.createdAt,
      organization: member.organization,
      email: users.get(member.authUserId)?.email ?? 'Akun tidak ditemukan',
      name: users.get(member.authUserId)?.name ?? '',
      banned: users.get(member.authUserId)?.banned ?? false,
      protected: protectedSet.has(member.authUserId),
    }));
  }

  private async ensureOrg(id: string) {
    const organization = await this.prisma.organization.findUnique({ where: { id } });
    if (!organization) throw new NotFoundException('Organisasi tidak ditemukan.');
  }

  private async ensureMutable(id: string, caller?: string) {
    const member = await this.prisma.organizationMember.findUnique({ where: { id } });
    if (!member) throw new NotFoundException('Keanggotaan tidak ditemukan.');
    if (member.authUserId === caller) {
      throw new ForbiddenException('Tidak boleh mengubah atau mencabut akses diri sendiri.');
    }
    if (member.role === 'SUPER_ADMIN') {
      throw new ForbiddenException('Keanggotaan SUPER_ADMIN dilindungi.');
    }
    const global = await this.prisma.$queryRaw<Array<{ role: string }>>`
      SELECT role FROM ledgercore_security.user_roles
      WHERE user_id = CAST(${member.authUserId} AS UUID)
        AND role = 'SUPER_ADMIN' AND is_active = TRUE LIMIT 1
    `;
    if (global.length > 0) {
      throw new ForbiddenException('Akun Super Admin global dilindungi.');
    }
    return member;
  }

  async invite(value: unknown) {
    const input = fields(value);
    const organizationId = uuid(input.organizationId, 'Organisasi');
    const memberRole = role(input.role);
    const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : '';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      throw new BadRequestException('Alamat email tidak valid.');
    }
    await this.ensureOrg(organizationId);
    const admin = this.admin();
    const siteUrl = (this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000').replace(/\/$/, '');
    const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${siteUrl}/auth/callback`,
    });
    if (error || !data.user) {
      throw new BadRequestException(
        error?.message ?? 'Undangan gagal. Jika email sudah terdaftar, gunakan Tambah Anggota dengan UID.',
      );
    }
    try {
      const membership = await this.prisma.organizationMember.create({
        data: { organizationId, authUserId: data.user.id, role: memberRole },
      });
      return { id: membership.id, message: 'Undangan terkirim dan keanggotaan dibuat.' };
    } catch (error) {
      if (codeOf(error) === 'P2002') {
        throw new ConflictException('Akun telah menjadi anggota organisasi. Undangan mungkin sudah dikirim.');
      }
      throw new ServiceUnavailableException(
        'Undangan berhasil dikirim, tetapi pencatatan keanggotaan gagal. Gunakan Tambah Anggota dengan UID untuk memperbaiki.',
      );
    }
  }

  async addExisting(value: unknown) {
    const input = fields(value);
    const organizationId = uuid(input.organizationId, 'Organisasi');
    const authUserId = uuid(input.authUserId, 'User UID');
    const memberRole = role(input.role);
    await this.ensureOrg(organizationId);
    const { data, error } = await this.admin().auth.admin.getUserById(authUserId);
    if (error || !data.user) throw new NotFoundException('User UID tidak ditemukan di Supabase Auth.');
    try {
      return await this.prisma.organizationMember.create({
        data: { organizationId, authUserId, role: memberRole },
      });
    } catch (error) {
      if (codeOf(error) === 'P2002') throw new ConflictException('Pengguna sudah bergabung di organisasi ini.');
      throw error;
    }
  }

  async changeRole(id: string, value: unknown, caller?: string) {
    const member = await this.ensureMutable(uuid(id, 'Keanggotaan'), caller);
    const memberRole = role(fields(value).role);
    return this.prisma.organizationMember.update({
      where: { id: member.id }, data: { role: memberRole },
    });
  }

  async remove(id: string, caller?: string) {
    const member = await this.ensureMutable(uuid(id, 'Keanggotaan'), caller);
    await this.prisma.organizationMember.delete({ where: { id: member.id } });
    return { ok: true, message: 'Akses organisasi berhasil dicabut. Akun Supabase tetap ada.' };
  }
}
