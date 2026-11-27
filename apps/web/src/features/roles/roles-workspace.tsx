'use client';

import { Fragment, useMemo, useState } from 'react';
import Link from 'next/link';

import {
  ArrowRight,
  Check,
  ChevronDown,
  ClipboardCopy,
  KeyRound,
  LockKeyhole,
  Minus,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Users,
} from 'lucide-react';

export type RoleEntry = {
  code: string;
  label: string;
  scope: 'global' | 'organization';
  permissions: string[];
};

export type RoleCatalogPayload = {
  version: 'stage6c-v1';
  readOnly: true;
  permissions: string[];
  roles: RoleEntry[];
};

const LABELS: Record<string, string> = {
  'workspace.read': 'Akses dashboard',
  'organizations.read': 'Melihat organisasi',
  'organizations.manage': 'Mengelola organisasi',
  'users.read': 'Melihat pengguna',
  'users.manage': 'Mengelola pengguna',
  'roles.read': 'Melihat role dan izin',
  'roles.manage': 'Mengubah role dan izin',
  'accounts.read': 'Melihat daftar akun',
  'accounts.manage': 'Mengelola daftar akun',
  'journals.read': 'Melihat jurnal',
  'journals.manage': 'Membuat dan mengubah jurnal',
  'journals.post': 'Posting jurnal',
  'expenses.read': 'Melihat pengeluaran',
  'expenses.manage': 'Mengelola pengeluaran',
  'expenses.approve': 'Menyetujui pengeluaran',
  'payables.read': 'Melihat utang usaha',
  'payables.manage': 'Mengelola utang usaha',
  'receivables.read': 'Melihat piutang usaha',
  'receivables.manage': 'Mengelola piutang usaha',
  'reports.read': 'Melihat laporan keuangan',
  'audit.read': 'Melihat audit trail',
};

const GROUPS = [
  'Workspace',
  'Administrasi',
  'Akuntansi',
  'Operasional',
  'Pelaporan',
];

function groupFor(code: string) {
  const section = code.split('.')[0];

  if (section === 'workspace') return 'Workspace';

  if (
    ['organizations', 'users', 'roles'].includes(section)
  ) return 'Administrasi';

  if (
    ['accounts', 'journals'].includes(section)
  ) return 'Akuntansi';

  if (
    ['expenses', 'payables', 'receivables'].includes(section)
  ) return 'Operasional';

  return 'Pelaporan';
}

export default function RolesWorkspace({
  catalog,
}: {
  catalog: RoleCatalogPayload;
}) {
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState('all');
  const [focusRole, setFocusRole] = useState('all');
  const [grantedOnly, setGrantedOnly] = useState(false);
  const [copied, setCopied] = useState(false);

  const shownRoles = useMemo(
    () => catalog.roles.filter(
      (role) =>
        focusRole === 'all' || focusRole === role.code
    ),
    [catalog.roles, focusRole],
  );

  const rows = useMemo(
    () => catalog.permissions.filter((permission) => {
      const text = (
        `${LABELS[permission] ?? permission} ${permission}`
      ).toLocaleLowerCase('id-ID');

      if (
        !text.includes(query.trim().toLocaleLowerCase('id-ID'))
      ) return false;

      if (
        group !== 'all' &&
        groupFor(permission) !== group
      ) return false;

      if (
        grantedOnly &&
        !shownRoles.some(
          (r) => r.permissions.includes(permission)
        )
      ) return false;

      return true;
    }),
    [
      catalog.permissions,
      query,
      group,
      grantedOnly,
      shownRoles,
    ],
  );

  const assigned = catalog.roles.reduce(
    (sum, role) => sum + role.permissions.length,
    0,
  );

  async function copyMatrix() {
    const content = [
      [
        'Permission',
        ...shownRoles.map((r) => r.label),
      ].join('\t'),
      ...rows.map((permission) => [
        LABELS[permission] ?? permission,
        ...shownRoles.map((r) =>
          r.permissions.includes(permission) ? 'Ya' : 'Tidak'
        ),
      ].join('\t')),
    ].join('\n');

    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="space-y-5 pb-10 text-[#27354c]">
      <header className="flex flex-wrap items-start justify-between gap-4 border border-[#e2e8f0] bg-white px-5 py-5 shadow-sm sm:px-6">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[.14em] text-slate-500">
            LEDGERCORE / ADMINISTRASI
          </p>

          <h1 className="mt-2 flex items-center gap-2 text-2xl font-bold tracking-tight text-[#28364f]">
            <ShieldCheck size={25} />
            Role & Permissions
          </h1>

          <p className="mt-2 max-w-2xl text-[13px] leading-6 text-slate-500">
            Matriks izin berdasarkan kebijakan NestJS.
            Pengaturan ini hanya dapat dilihat,
            belum dapat diubah melalui halaman ini.
          </p>
        </div>

        <Link
          href="/users"
          className="inline-flex min-h-10 items-center gap-2 border border-[#2c4165] bg-[#2c4165] px-4 text-xs font-semibold text-white transition-colors hover:bg-[#3e5681]"
        >
          <Users size={15} />
          Manajemen Pengguna
          <ArrowRight size={14} />
        </Link>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          {
            title: 'Role terdaftar',
            number: catalog.roles.length,
            icon: Users,
          },
          {
            title: 'Jenis permission',
            number: catalog.permissions.length,
            icon: KeyRound,
          },
          {
            title: 'Total izin diberikan',
            number: assigned,
            icon: LockKeyhole,
          },
        ].map((item) => (
          <section
            key={item.title}
            className="border border-[#e2e8f0] bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              {item.title}
              <item.icon size={18} />
            </div>

            <div className="mt-3 text-3xl font-bold tabular-nums text-[#293650]">
              {item.number}
            </div>
          </section>
        ))}
      </div>

      <section className="overflow-hidden border border-[#e2e8f0] bg-white shadow-sm">
        <div className="space-y-4 border-b border-slate-200 p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-[#293650]">
                Matriks Hak Akses
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Cari dan filter izin berdasarkan role.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void copyMatrix()}
              className="inline-flex min-h-10 items-center gap-2 border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              <ClipboardCopy size={15} />
              {copied ? 'Matriks tersalin' : 'Salin matriks'}
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(200px,1fr)_180px_190px]">
            <label className="relative block">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-3 text-slate-400"
              />

              <input
                aria-label="Cari permission"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari nama atau kode permission..."
                className="h-10 w-full min-w-0 border border-slate-200 bg-white pl-9 pr-3 text-xs outline-none focus:border-slate-500"
              />
            </label>

            <label className="relative block">
              <span className="sr-only">
                Filter kategori permission
              </span>

              <SlidersHorizontal
                size={15}
                className="pointer-events-none absolute left-3 top-3 text-slate-400"
              />

              <select
                aria-label="Filter kategori permission"
                value={group}
                onChange={(e) => setGroup(e.target.value)}
                className="h-10 w-full appearance-none border border-slate-200 bg-white pl-9 pr-8 text-xs outline-none"
              >
                <option value="all">Semua kategori</option>
                {GROUPS.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-3 top-3 text-slate-400"
              />
            </label>

            <label className="relative block sm:col-span-2 xl:col-span-1">
              <span className="sr-only">Filter role</span>

              <select
                aria-label="Filter role"
                value={focusRole}
                onChange={(e) => setFocusRole(e.target.value)}
                className="h-10 w-full appearance-none border border-slate-200 bg-white px-3 pr-8 text-xs outline-none"
              >
                <option value="all">Semua role</option>

                {catalog.roles.map((role) => (
                  <option key={role.code} value={role.code}>
                    {role.label}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={14}
                className="pointer-events-none absolute right-3 top-3 text-slate-400"
              />
            </label>
          </div>

          <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-slate-600">
            <input
              type="checkbox"
              checked={grantedOnly}
              onChange={(e) =>
                setGrantedOnly(e.target.checked)
              }
              className="h-4 w-4 accent-[#334a6c]"
            />
            Hanya tampilkan permission yang diberikan
          </label>
        </div>

        <div className="max-w-full overflow-x-auto">
          <table className="w-full min-w-[840px] border-collapse text-left text-xs">
            <thead className="bg-[#f5f7f9] text-slate-600">
              <tr>
                <th
                  scope="col"
                  className="sticky left-0 z-20 min-w-[265px] border-b border-r border-slate-200 bg-[#f5f7f9] px-5 py-4 text-left text-[11px] font-bold uppercase"
                >
                  Permission
                </th>

                {shownRoles.map((role) => (
                  <th
                    key={role.code}
                    scope="col"
                    className="min-w-[113px] border-b border-slate-200 px-2 py-4 text-center text-[11px] font-bold"
                  >
                    <span className="block leading-4">
                      {role.label}
                    </span>

                    <span className="mt-1 block text-[10px] font-normal text-slate-400">
                      {role.permissions.length} izin
                    </span>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {rows.map((permission, index) => {
                const groupName = groupFor(permission);
                const startGroup =
                  index === 0 ||
                  groupName !== groupFor(rows[index - 1]);

                return (
                  <Fragment key={permission}>
                    {startGroup && (
                      <tr>
                        <th
                          colSpan={shownRoles.length + 1}
                          scope="rowgroup"
                          className="border-b border-slate-200 bg-[#f8f9fb] px-5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500"
                        >
                          {groupName}
                        </th>
                      </tr>
                    )}

                    <tr className="group hover:bg-slate-50">
                      <th
                        scope="row"
                        className="sticky left-0 z-10 border-b border-r border-slate-100 bg-white px-5 py-3.5 text-left group-hover:bg-slate-50"
                      >
                        <span className="block text-xs font-semibold text-[#364359]">
                          {LABELS[permission] ?? permission}
                        </span>

                        <span className="mt-1 block font-mono text-[10px] font-normal text-slate-400">
                          {permission}
                        </span>
                      </th>

                      {shownRoles.map((role) => {
                        const enabled =
                          role.permissions.includes(permission);

                        return (
                          <td
                            key={role.code}
                            className="border-b border-slate-100 px-2 py-3.5 text-center"
                          >
                            <span
                              title={
                                enabled
                                  ? 'Diizinkan'
                                  : 'Tidak diizinkan'
                              }
                              aria-label={
                                `${role.label}: ${
                                  enabled
                                    ? 'diizinkan'
                                    : 'tidak diizinkan'
                                }`
                              }
                              className={
                                `inline-flex h-7 w-7 items-center justify-center border ${
                                  enabled
                                    ? 'border-slate-300 bg-slate-100 text-slate-700'
                                    : 'border-transparent text-slate-300'
                                }`
                              }
                            >
                              {enabled ? (
                                <Check size={15} strokeWidth={2.4} />
                              ) : (
                                <Minus size={15} />
                              )}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  </Fragment>
                );
              })}
            </tbody>
          </table>

          {!rows.length && (
            <div className="px-6 py-12 text-center text-sm text-slate-500">
              Tidak ada permission yang cocok.
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 text-[11px] text-slate-500 sm:px-5">
          <span>
            {rows.length} permission ditampilkan ·{' '}
            {shownRoles.length} role
          </span>

          <span className="inline-flex items-center gap-2">
            <Check size={14} />
            Diizinkan
            <Minus size={14} className="ml-2" />
            Tidak diizinkan
          </span>
        </div>
      </section>

      <p className="flex items-start gap-2 text-xs leading-6 text-slate-500">
        <LockKeyhole size={15} className="mt-1 shrink-0" />
        Matriks ini menampilkan policy Stage 6B.
        Pengamanan seluruh endpoint transaksi masih perlu
        diimplementasikan dan diuji secara terpisah.
      </p>
    </div>
  );
}
