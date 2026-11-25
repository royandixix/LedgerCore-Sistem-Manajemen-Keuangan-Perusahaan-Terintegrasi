'use server';
import { revalidatePath } from 'next/cache';
import { apiRequest } from './users.api';

type Result = { ok: boolean; message: string };
export async function manageUserAction(
  operation: 'invite' | 'add' | 'role' | 'remove',
  input: { email?: string; organizationId?: string; authUserId?: string; role?: string; membershipId?: string },
): Promise<Result> {
  const id = input.membershipId;
  if (!['invite', 'add', 'role', 'remove'].includes(operation)) {
    return { ok: false, message: 'Aksi tidak valid.' };
  }
  if ((operation === 'role' || operation === 'remove') &&
    (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))) {
    return { ok: false, message: 'ID keanggotaan tidak valid.' };
  }
  const routes = {
    invite: '/users/invite',
    add: '/users/memberships',
    role: `/users/memberships/${encodeURIComponent(id ?? '')}`,
    remove: `/users/memberships/${encodeURIComponent(id ?? '')}`,
  };
  try {
    const response = await apiRequest(routes[operation], {
      method: operation === 'role' ? 'PATCH' : operation === 'remove' ? 'DELETE' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: operation === 'remove' ? undefined : JSON.stringify(input),
    });
    const data: unknown = await response.json().catch(() => null);
    const messageValue = data && typeof data === 'object' && 'message' in data
      ? (data as { message: unknown }).message : null;
    const message = Array.isArray(messageValue)
      ? messageValue.filter((item): item is string => typeof item === 'string').join('; ')
      : typeof messageValue === 'string' ? messageValue : '';
    if (!response.ok) {
      return { ok: false, message: message || `Operasi ditolak (HTTP ${response.status}).` };
    }
    revalidatePath('/users');
    const success = {
      invite: 'Undangan berhasil dikirim.',
      add: 'Anggota organisasi berhasil ditambahkan.',
      role: 'Role anggota berhasil diperbarui.',
      remove: 'Keanggotaan dicabut. Akun Auth tidak dihapus.',
    };
    return { ok: true, message: message || success[operation] };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : 'Gagal menghubungi API.' };
  }
}
