import { createClient } from '../../lib/supabase/server';
import type { UserMember, UserOrg } from './users.shared';

function base() {
  return (process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:4000/api/v1').replace(/\/+$/, '');
}
export async function apiRequest(path: string, init: RequestInit = {}) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('Sesi berakhir. Masuk kembali.');
  return fetch(`${base()}${path}`, {
    ...init, cache: 'no-store',
    headers: { ...init.headers, Authorization: `Bearer ${token}` },
  });
}

export async function getUserWorkspace(): Promise<{
  users: UserMember[]; organizations: UserOrg[]; error: string | null;
}> {
  try {
    const [usersResponse, organizationsResponse] = await Promise.all([
      apiRequest('/users'), apiRequest('/users/organizations'),
    ]);
    if (!usersResponse.ok || !organizationsResponse.ok) {
      return {
        users: [], organizations: [],
        error: `API tidak tersedia atau akses ditolak (HTTP ${usersResponse.status}/${organizationsResponse.status}).`,
      };
    }
    const users = (await usersResponse.json()) as UserMember[];
    const organizations = (await organizationsResponse.json()) as UserOrg[];
    if (!Array.isArray(users) || !Array.isArray(organizations)) throw new Error('Format API salah.');
    return { users, organizations, error: null };
  } catch (error) {
    return { users: [], organizations: [], error: error instanceof Error ? error.message : 'API tidak tersedia.' };
  }
}
