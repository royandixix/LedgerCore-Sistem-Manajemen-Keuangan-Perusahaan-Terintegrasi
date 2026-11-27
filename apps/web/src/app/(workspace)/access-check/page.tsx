import { Suspense } from 'react';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '../../../lib/supabase/server';

type Result = {
  label: string;
  path: string;
  expected: number;
  actual: number | null;
};

type Identity = {
  status: number | null;
  role: string | null;
  scope: string | null;
  organizationId: string | null;
};

const MEMBER_ROLES = [
  'FINANCE_ADMIN',
  'ACCOUNTANT',
  'FINANCE_MANAGER',
  'AP_OFFICER',
  'AR_OFFICER',
  'AUDITOR',
];

function Notice({
  title,
  detail,
}: {
  title: string;
  detail: string;
}) {
  return (
    <section className="border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-bold text-slate-800">
        {title}
      </h2>
      <p className="mt-2 text-sm text-slate-500">
        {detail}
      </p>
    </section>
  );
}

async function getIdentity(
  base: string,
  token: string,
): Promise<Identity> {
  try {
    const response = await fetch(
      `${base}/auth/permissions`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
        signal: AbortSignal.timeout(10000),
      },
    );

    if (!response.ok) {
      return {
        status: response.status,
        role: null,
        scope: null,
        organizationId: null,
      };
    }

    const payload: unknown = await response.json();

    if (!payload || typeof payload !== 'object') {
      return {
        status: 200,
        role: null,
        scope: null,
        organizationId: null,
      };
    }

    const data = payload as Record<string, unknown>;

    return {
      status: 200,
      role:
        typeof data.role === 'string'
          ? data.role
          : null,
      scope:
        typeof data.roleScope === 'string'
          ? data.roleScope
          : null,
      organizationId:
        typeof data.organizationId === 'string'
          ? data.organizationId
          : null,
    };
  } catch {
    return {
      status: null,
      role: null,
      scope: null,
      organizationId: null,
    };
  }
}

async function probe(
  base: string,
  token: string,
  item: Omit<Result, 'actual'>,
): Promise<Result> {
  try {
    const response = await fetch(
      `${base}${item.path}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
        redirect: 'manual',
        signal: AbortSignal.timeout(10000),
      },
    );

    return {
      ...item,
      actual: response.status,
    };
  } catch {
    return {
      ...item,
      actual: null,
    };
  }
}

async function AccessContent() {
  const supabase = await createClient();

  const {
    data: claims,
    error: claimsError,
  } = await supabase.auth.getClaims();

  if (claimsError || !claims?.claims) {
    redirect('/login');
  }

  const {
    data: sessionData,
    error: sessionError,
  } = await supabase.auth.getSession();

  const token = sessionData.session?.access_token;

  if (sessionError || !token) {
    redirect('/login');
  }

  const base = (
    process.env.NEXT_PUBLIC_API_URL ??
    'http://127.0.0.1:4000/api/v1'
  ).replace(/\/$/, '');

  const identity = await getIdentity(base, token);

  if (identity.status !== 200) {
    return (
      <Notice
        title="API Permissions belum berhasil"
        detail={
          identity.status === null
            ? 'Backend tidak merespons dalam batas waktu.'
            : `Backend mengembalikan HTTP ${identity.status}.`
        }
      />
    );
  }

  const {
    role,
    scope,
    organizationId,
  } = identity;

  const isAdmin =
    role === 'SUPER_ADMIN' &&
    scope === 'global' &&
    organizationId === null;

  const isMember =
    role !== null &&
    MEMBER_ROLES.includes(role) &&
    scope === 'organization' &&
    organizationId !== null;

  if (!isAdmin && !isMember) {
    return (
      <Notice
        title="Role atau keanggotaan belum sesuai"
        detail={`Role: ${role ?? 'Kosong'}; scope: ${scope ?? 'Kosong'}; organisasi: ${organizationId ? 'Ada' : 'Tidak ada'}.`}
      />
    );
  }

  const targets: Omit<Result, 'actual'>[] = [
    {
      label: 'Identitas akun',
      path: '/auth/me',
      expected: 200,
    },
    {
      label: 'Akses dashboard',
      path: '/auth/dashboard-access',
      expected: 200,
    },
    {
      label: 'Katalog Role & Permissions',
      path: '/auth/permissions/catalog',
      expected: isAdmin ? 200 : 403,
    },
    {
      label: 'Administrasi pengguna',
      path: '/users',
      expected: isAdmin ? 200 : 403,
    },
    {
      label: 'Administrasi organisasi',
      path: '/organizations',
      expected: isAdmin ? 200 : 403,
    },
  ];

  const results: Result[] = [{
    label: 'Permissions pengguna aktif',
    path: '/auth/permissions',
    expected: 200,
    actual: identity.status,
  }];

  for (let i = 0; i < targets.length; i += 2) {
    const batch = await Promise.all(
      targets.slice(i, i + 2).map(
        (item) => probe(base, token, item)
      ),
    );

    results.push(...batch);
  }

  const passed = results.filter(
    (item) => item.actual === item.expected
  ).length;

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          ['Role aktif', role ?? '-'],
          ['Lingkup akses', isAdmin ? 'Global' : 'Organisasi'],
          ['Pemeriksaan lulus', `${passed}/${results.length}`],
        ].map(([label, value]) => (
          <section
            key={label}
            className="border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-xs font-semibold text-slate-500">
              {label}
            </p>
            <p className="mt-3 break-words text-xl font-bold text-[#293650]">
              {value}
            </p>
          </section>
        ))}
      </div>

      <section className="overflow-hidden border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-sm font-bold text-slate-800">
            Pemeriksaan Hak Akses
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Hanya GET, berdasarkan sesi login aktif.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[570px] text-left text-xs">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="p-4">Endpoint</th>
                <th className="p-4">Target</th>
                <th className="p-4">Aktual</th>
                <th className="p-4">Hasil</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {results.map((item) => {
                const success =
                  item.actual === item.expected;

                return (
                  <tr
                    key={item.path}
                    className="hover:bg-slate-50"
                  >
                    <td className="p-4">
                      <div className="font-semibold text-slate-700">
                        {item.label}
                      </div>
                      <div className="mt-1 font-mono text-[10px] text-slate-500">
                        {item.path}
                      </div>
                    </td>
                    <td className="p-4 tabular-nums">
                      {item.expected}
                    </td>
                    <td className="p-4 tabular-nums">
                      {item.actual ?? 'Timeout'}
                    </td>
                    <td className="p-4">
                      <span
                        className={
                          success
                            ? 'font-bold text-emerald-700'
                            : 'font-bold text-rose-700'
                        }
                      >
                        {success ? 'Lulus' : 'Perlu cek'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <p className="text-xs leading-6 text-slate-500">
        Pemeriksaan ini tidak mengubah data atau role.
        Hasil belum mencakup isolasi transaksi keuangan
        lintas organisasi.
      </p>
    </div>
  );
}

function Loading() {
  return (
    <div
      role="status"
      aria-label="Memeriksa hak akses"
      className="animate-pulse space-y-4"
    >
      <div className="grid gap-3 sm:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-28 border border-slate-200 bg-white p-5"
          >
            <div className="h-4 w-28 bg-slate-100" />
            <div className="mt-5 h-7 w-20 bg-slate-200" />
          </div>
        ))}
      </div>
      <div className="h-72 border border-slate-200 bg-white p-5">
        <div className="h-5 w-44 bg-slate-200" />
        <div className="mt-5 h-9 bg-slate-100" />
        <div className="mt-3 h-9 bg-slate-100" />
        <div className="mt-3 h-9 bg-slate-100" />
      </div>
    </div>
  );
}

export default function AccessCheckPage() {
  if (process.env.NODE_ENV !== 'development') {
    notFound();
  }

  return (
    <div className="space-y-5 pb-10 text-[#293650]">
      <header className="flex flex-wrap items-center justify-between gap-4 border border-slate-200 bg-white p-5">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            LEDGERCORE / SECURITY
          </p>
          <h1 className="mt-2 text-2xl font-bold">
            Stage 6D — Live Access Check
          </h1>
          <p className="mt-2 text-xs text-slate-500">
            Verifikasi autentikasi dan pembatasan role.
          </p>
        </div>
        <Link
          href="/roles"
          className="border border-[#293b5d] bg-[#293b5d] px-4 py-3 text-xs font-semibold text-white hover:bg-[#354c73]"
        >
          Role & Permissions
        </Link>
      </header>

      <Suspense fallback={<Loading />}>
        <AccessContent />
      </Suspense>
    </div>
  );
}
