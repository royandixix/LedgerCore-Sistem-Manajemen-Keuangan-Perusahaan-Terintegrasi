import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '../../../lib/supabase/server';

import RolesWorkspace, {
  type RoleCatalogPayload,
} from '../../../features/roles/roles-workspace';

function Notice({
  title,
  detail,
}: {
  title: string;
  detail: string;
}) {
  return (
    <div className="border border-slate-200 bg-white p-7 text-[#293650]">
      <h1 className="text-xl font-bold">{title}</h1>
      <p className="mt-2 text-sm leading-6 text-slate-500">
        {detail}
      </p>
    </div>
  );
}

function validCatalog(
  value: unknown,
): value is RoleCatalogPayload {
  if (!value || typeof value !== 'object') return false;

  const data = value as Partial<RoleCatalogPayload>;

  return (
    data.version === 'stage6c-v1' &&
    data.readOnly === true &&
    Array.isArray(data.permissions) &&
    data.permissions.every(
      (p) => typeof p === 'string'
    ) &&
    Array.isArray(data.roles) &&
    data.roles.length === 7 &&
    data.roles.every(
      (role) =>
        role &&
        typeof role.code === 'string' &&
        typeof role.label === 'string' &&
        (
          role.scope === 'global' ||
          role.scope === 'organization'
        ) &&
        Array.isArray(role.permissions) &&
        role.permissions.every(
          (p) => typeof p === 'string'
        )
    )
  );
}

async function RolesContent() {
  const supabase = await createClient();

  const {
    data: claims,
    error: claimError,
  } = await supabase.auth.getClaims();

  if (claimError || !claims?.claims) {
    redirect('/login');
  }

  const {
    data,
    error,
  } = await supabase.auth.getSession();

  if (error || !data.session?.access_token) {
    redirect('/login');
  }

  const api = (
    process.env.NEXT_PUBLIC_API_URL ??
    'http://127.0.0.1:4000/api/v1'
  ).replace(/\/$/, '');

  let response: Response;

  try {
    response = await fetch(
      `${api}/auth/permissions/catalog`,
      {
        headers: {
          Authorization: `Bearer ${data.session.access_token}`,
        },
        cache: 'no-store',
        signal: AbortSignal.timeout(10000),
      }
    );
  } catch {
    return (
      <Notice
        title="Layanan izin belum tersedia"
        detail="Backend NestJS belum bisa dihubungi. Periksa server API."
      />
    );
  }

  if (response.status === 401) {
    redirect('/login');
  }

  if (response.status === 403) {
    return (
      <Notice
        title="Akses ditolak"
        detail="Matriks hak akses global hanya tersedia untuk Super Administrator."
      />
    );
  }

  if (!response.ok) {
    return (
      <Notice
        title="Tidak dapat memuat matriks"
        detail={`Backend mengembalikan HTTP ${response.status}.`}
      />
    );
  }

  let payload: unknown;

  try {
    payload = await response.json();
  } catch {
    return (
      <Notice
        title="Respons API tidak valid"
        detail="Format respons backend tidak dapat dibaca."
      />
    );
  }

  if (!validCatalog(payload)) {
    return (
      <Notice
        title="Matriks izin belum sinkron"
        detail="Format policy backend tidak sesuai dengan versi UI."
      />
    );
  }

  return <RolesWorkspace catalog={payload} />;
}


function RolesLoading() {
  return (
    <div
      role="status"
      aria-label="Memuat Role dan Permissions"
      className="animate-pulse space-y-5 pb-10"
    >
      <div className="border border-slate-200 bg-white p-6">
        <div className="h-3 w-36 bg-slate-100" />
        <div className="mt-4 h-7 w-64 max-w-full bg-slate-200" />
        <div className="mt-3 h-3 w-full max-w-md bg-slate-100" />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-28 border border-slate-200 bg-white p-5"
          >
            <div className="h-3 w-28 bg-slate-100" />
            <div className="mt-5 h-8 w-14 bg-slate-200" />
          </div>
        ))}
      </div>

      <div className="border border-slate-200 bg-white p-5">
        <div className="h-5 w-48 bg-slate-200" />
        <div className="mt-6 space-y-4">
          {[1, 2, 3, 4, 5].map((item) => (
            <div
              key={item}
              className="h-10 w-full bg-slate-100"
            />
          ))}
        </div>
      </div>

      <span className="sr-only">
        Memeriksa sesi dan memuat matriks hak akses.
      </span>
    </div>
  );
}

export default function RolesPage() {
  return (
    <Suspense fallback={<RolesLoading />}>
      <RolesContent />
    </Suspense>
  );
}
