'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '../../../lib/supabase/server';

type ActionResult = {
  ok: boolean;
  message: string;
};

async function saveOrganization(
  method: 'POST' | 'PATCH',
  id: string | null,
  data: FormData,
): Promise<ActionResult> {
  const supabase = await createClient();

  const { data: claims, error } = await supabase.auth.getClaims();

  if (error || !claims?.claims) {
    return {
      ok: false,
      message: 'Sesi tidak valid. Silakan login kembali.',
    };
  }

  const { data: session } = await supabase.auth.getSession();
  const token = session.session?.access_token;

  if (!token) {
    return {
      ok: false,
      message: 'Sesi berakhir. Login kembali.',
    };
  }

  const name = data.get('name');
  const slug = data.get('slug');
  const currency = data.get('defaultCurrency');

  if (
    typeof name !== 'string' ||
    typeof slug !== 'string' ||
    typeof currency !== 'string'
  ) {
    return {
      ok: false,
      message: 'Form tidak valid.',
    };
  }

  const apiBase = (
    process.env.NEXT_PUBLIC_API_URL ??
    'http://127.0.0.1:4000/api/v1'
  ).replace(/\/+$/, '');

  const path = id
    ? `/organizations/${encodeURIComponent(id)}`
    : '/organizations';

  try {
    const response = await fetch(`${apiBase}${path}`, {
      method,
      cache: 'no-store',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        slug,
        defaultCurrency: currency,
      }),
    });

    if (response.ok) {
      revalidatePath('/organizations');

      return {
        ok: true,
        message:
          method === 'POST'
            ? 'Organisasi berhasil ditambahkan.'
            : 'Organisasi berhasil diperbarui.',
      };
    }

    const raw: unknown = await response.json().catch(() => null);

    const detail =
      raw && typeof raw === 'object' && 'message' in raw
        ? (raw as { message: unknown }).message
        : null;

    const message =
      typeof detail === 'string'
        ? detail
        : Array.isArray(detail)
          ? detail
              .filter(
                (item): item is string =>
                  typeof item === 'string',
              )
              .join(', ')
          : null;

    if (response.status === 401 || response.status === 403) {
      return {
        ok: false,
        message: 'Tidak memiliki izin Super Admin atau sesi berakhir.',
      };
    }

    if (response.status === 503) {
      return {
        ok: false,
        message:
          'Database belum siap. Migration Organizations belum diterapkan.',
      };
    }

    return {
      ok: false,
      message:
        message ||
        `Penyimpanan gagal (HTTP ${response.status}).`,
    };
  } catch {
    return {
      ok: false,
      message: 'API NestJS tidak dapat dihubungi.',
    };
  }
}

export async function createOrganizationAction(
  data: FormData,
): Promise<ActionResult> {
  return saveOrganization('POST', null, data);
}

export async function updateOrganizationAction(
  id: string,
  data: FormData,
): Promise<ActionResult> {
  return saveOrganization('PATCH', id, data);
}


export async function deleteOrganizationAction(
  id: string,
): Promise<ActionResult> {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return {
      ok: false,
      message: 'ID organisasi tidak valid.',
    };
  }

  const supabase = await createClient();

  const { data: claims, error } =
    await supabase.auth.getClaims();

  if (error || !claims?.claims) {
    return {
      ok: false,
      message: 'Sesi tidak valid. Masuk kembali.',
    };
  }

  const { data: session } =
    await supabase.auth.getSession();

  const token = session.session?.access_token;

  if (!token) {
    return {
      ok: false,
      message: 'Sesi berakhir. Masuk kembali.',
    };
  }

  const apiBase = (
    process.env.NEXT_PUBLIC_API_URL ??
    'http://127.0.0.1:4000/api/v1'
  ).replace(/\/+$/, '');

  try {
    const response = await fetch(
      `${apiBase}/organizations/${encodeURIComponent(id)}`,
      {
        method: 'DELETE',
        cache: 'no-store',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (response.ok) {
      revalidatePath('/organizations');

      return {
        ok: true,
        message: 'Organisasi berhasil dihapus.',
      };
    }

    if (
      response.status === 401 ||
      response.status === 403
    ) {
      return {
        ok: false,
        message:
          'Akses ditolak. Hanya Super Admin yang diizinkan.',
      };
    }

    const raw: unknown =
      await response.json().catch(() => null);

    const detail =
      raw &&
      typeof raw === 'object' &&
      'message' in raw
        ? (raw as { message: unknown }).message
        : null;

    return {
      ok: false,
      message:
        typeof detail === 'string'
          ? detail
          : `Gagal menghapus organisasi (HTTP ${response.status}).`,
    };
  } catch {
    return {
      ok: false,
      message: 'Tidak dapat terhubung ke NestJS.',
    };
  }
}
