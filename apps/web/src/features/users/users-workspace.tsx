'use client';

import { useEffect, useMemo, useState, useTransition, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight, Building2, CheckCircle2, ChevronDown, CircleHelp, FilterX,
  BarChart3, Calculator, CreditCard, Wallet, ScanSearch, Copy,
  Fingerprint, KeyRound, LoaderCircle, LockKeyhole, MailPlus,
  SquarePen, Search, ShieldCheck, SlidersHorizontal, Sparkles, UserRoundX,
  UserRoundPlus, Users, X,
} from 'lucide-react';
import { manageUserAction } from './users.actions';
import { MEMBER_ROLES, type MemberRole, type UserMember, type UserOrg } from './users.shared';
import effects from './users-effects.module.css';

type Mode = 'invite' | 'add';
type Sort = 'recent' | 'name' | 'role';

const names: Record<MemberRole, string> = {
  FINANCE_ADMIN: 'Finance Admin',
  ACCOUNTANT: 'Accountant',
  FINANCE_MANAGER: 'Finance Manager',
  AP_OFFICER: 'AP Officer',
  AR_OFFICER: 'AR Officer',
  AUDITOR: 'Auditor',
};

/* LEDGERCORE USERS MONO PALETTE V10 */
const roleTone: Record<MemberRole, string> = {
  FINANCE_ADMIN: 'bg-slate-100 text-slate-700 ring-slate-200',
  ACCOUNTANT: 'bg-slate-100 text-slate-700 ring-slate-200',
  FINANCE_MANAGER: 'bg-slate-100 text-slate-700 ring-slate-200',
  AP_OFFICER: 'bg-slate-100 text-slate-700 ring-slate-200',
  AR_OFFICER: 'bg-slate-100 text-slate-700 ring-slate-200',
  AUDITOR: 'bg-slate-100 text-slate-700 ring-slate-200',
};


const roleIcons: Record<MemberRole, typeof ShieldCheck> = {
  FINANCE_ADMIN: ShieldCheck,
  ACCOUNTANT: Calculator,
  FINANCE_MANAGER: BarChart3,
  AP_OFFICER: CreditCard,
  AR_OFFICER: Wallet,
  AUDITOR: ScanSearch,
};

const roleAvatarTone: Record<MemberRole, string> = {
  FINANCE_ADMIN: 'bg-slate-100 text-slate-600',
  ACCOUNTANT: 'bg-slate-100 text-slate-600',
  FINANCE_MANAGER: 'bg-slate-100 text-slate-600',
  AP_OFFICER: 'bg-slate-100 text-slate-600',
  AR_OFFICER: 'bg-slate-100 text-slate-600',
  AUDITOR: 'bg-slate-100 text-slate-600',
};

function memberRoleLabel(role: UserMember['role']) {
  return role === 'SUPER_ADMIN' ? 'Super Administrator' : names[role];
}

function badgeClass(role: UserMember['role']) {
  return role === 'SUPER_ADMIN' ? 'bg-slate-100 text-slate-700 ring-slate-200' : roleTone[role];
}


async function toast(icon: 'success' | 'error', message: string) {
  const { default: Swal } = await import('sweetalert2');
  const success = icon === 'success';
  await Swal.fire({
    toast: success,
    position: success ? 'top-end' : 'center',
    icon,
    title: success ? 'Berhasil' : 'Operasi tidak berhasil',
    text: message,
    showConfirmButton: !success,
    confirmButtonText: 'Mengerti',
    buttonsStyling: false,
    timer: success ? 2600 : undefined,
    timerProgressBar: success,
    backdrop: success ? false : 'rgba(12,25,47,.38)',
    customClass: {
      container: 'lc-users-swal-container',
      popup: success ? 'lc-users-swal lc-users-swal-toast' : 'lc-users-swal',
      title: 'lc-users-swal-title',
      htmlContainer: 'lc-users-swal-text',
      confirmButton: 'lc-users-swal-confirm',
    },
    showClass: { popup: 'lc-users-swal-enter' },
    hideClass: { popup: 'lc-users-swal-exit' },
  });
}
export function UsersWorkspace({
  users, organizations, error,
}: { users: UserMember[]; organizations: UserOrg[]; error: string | null }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState<'all' | MemberRole>('all');
  const [sort, setSort] = useState<Sort>('recent');
  const [mode, setMode] = useState<Mode | null>(null);
  const [email, setEmail] = useState('');
  const [uid, setUid] = useState('');
  const [organizationId, setOrganizationId] = useState(organizations[0]?.id ?? '');
  const [role, setRole] = useState<MemberRole>('ACCOUNTANT');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!mode) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busy) {
        setMode(null);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener('keydown', onKey);
    };
  }, [mode, busy]);

  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase('id-ID');
    const rows = users.filter((user) =>
      (filter === 'all' || user.organization.id === filter) &&
      (roleFilter === 'all' || user.role === roleFilter) &&
      `${user.email} ${user.name} ${user.organization.name} ${memberRoleLabel(user.role)}`
        .toLocaleLowerCase('id-ID').includes(query),
    );
    if (sort === 'name') rows.sort((a, b) =>
      (a.name || a.email).localeCompare(b.name || b.email, 'id'));
    if (sort === 'role') rows.sort((a, b) =>
      memberRoleLabel(a.role).localeCompare(memberRoleLabel(b.role), 'id'));
    return rows;
  }, [users, search, filter, roleFilter, sort]);

  const roleCounts = useMemo(() => MEMBER_ROLES.map((key) => ({
    role: key,
    count: users.filter((member) => member.role === key).length,
  })), [users]);
  const totalNotBanned = users.filter((user) => !user.banned).length;
  const hasFilters = Boolean(search.trim() || filter !== 'all' || roleFilter !== 'all' || sort !== 'recent');
  const available = !error && organizations.length > 0;

  async function open(next: Mode) {
    if (busy || !available) return;

    setBusy(true);

    const isInvite = next === 'invite';

    try {
      const { default: Swal } = await import('sweetalert2');

      const decision = await Swal.fire({
        title: isInvite ? 'Undang Pengguna' : 'Tambah Anggota',
        icon: 'info',

        html: `
          <div class="lc-users-create-grid">
            <label for="lc-member-identity">
              ${isInvite ? 'Email pengguna' : 'Supabase User UID'}
            </label>
            <input
              id="lc-member-identity"
              type="${isInvite ? 'email' : 'text'}"
              placeholder="${isInvite ? 'nama@perusahaan.com' : 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'}"
              autocomplete="off"
              spellcheck="false"
            />

            <label for="lc-member-org">Organisasi</label>
            <select id="lc-member-org"></select>

            <label for="lc-member-role">Role organisasi</label>
            <select id="lc-member-role"></select>

            <p>
              SUPER_ADMIN global tidak dapat diberikan
              melalui formulir ini.
            </p>
          </div>
        `,

        showCancelButton: true,
        confirmButtonText: isInvite
          ? 'Kirim Undangan'
          : 'Tambah Anggota',
        cancelButtonText: 'Batal',
        reverseButtons: true,
        focusConfirm: false,
        buttonsStyling: true,
        showLoaderOnConfirm: true,

        allowOutsideClick: () => !Swal.isLoading(),
        allowEscapeKey: () => !Swal.isLoading(),

        customClass: {
          popup: 'lc-users-native-swal lc-users-create-dialog',
          confirmButton: 'lc-users-native-edit',
          cancelButton: 'lc-users-native-cancel',
        },

        showClass: {
          popup: 'lc-users-create-enter',
        },

        hideClass: {
          popup: 'lc-users-create-exit',
        },

        didOpen: (popup) => {
          const identity =
            popup.querySelector<HTMLInputElement>(
              '#lc-member-identity'
            );

          const orgSelect =
            popup.querySelector<HTMLSelectElement>(
              '#lc-member-org'
            );

          const roleSelect =
            popup.querySelector<HTMLSelectElement>(
              '#lc-member-role'
            );

          if (orgSelect) {
            organizations.forEach((org) => {
              orgSelect.add(new Option(org.name, org.id));
            });
          }

          if (roleSelect) {
            MEMBER_ROLES.forEach((key) => {
              roleSelect.add(new Option(names[key], key));
            });

            roleSelect.value = 'ACCOUNTANT';
          }

          identity?.focus();
        },

        preConfirm: async () => {
          const popup = Swal.getPopup();

          const identityInput =
            popup?.querySelector<HTMLInputElement>(
              '#lc-member-identity'
            );

          const orgInput =
            popup?.querySelector<HTMLSelectElement>(
              '#lc-member-org'
            );

          const roleInput =
            popup?.querySelector<HTMLSelectElement>(
              '#lc-member-role'
            );

          const identifier =
            identityInput?.value.trim() ?? '';

          const orgId = orgInput?.value ?? '';

          const selectedRole = MEMBER_ROLES.find(
            (key) => key === roleInput?.value
          );

          if (
            isInvite &&
            (!identifier || !identityInput?.checkValidity())
          ) {
            Swal.showValidationMessage(
              'Masukkan alamat email yang valid.'
            );
            return false;
          }

          const uuidPattern =
            /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

          if (
            !isInvite &&
            !uuidPattern.test(identifier)
          ) {
            Swal.showValidationMessage(
              'Masukkan UID Supabase yang valid (UUID).'
            );
            return false;
          }

          if (
            !organizations.some((org) => org.id === orgId) ||
            !selectedRole
          ) {
            Swal.showValidationMessage(
              'Pilih organisasi dan role yang tersedia.'
            );
            return false;
          }

          try {
            const result = await manageUserAction(
              isInvite ? 'invite' : 'add',
              {
                email: isInvite ? identifier : '',
                authUserId: isInvite ? '' : identifier,
                organizationId: orgId,
                role: selectedRole,
              }
            );

            if (!result.ok) {
              Swal.showValidationMessage(result.message);
              return false;
            }

            return result.message;
          } catch {
            Swal.showValidationMessage(
              'Tidak dapat terhubung ke API. Coba lagi.'
            );
            return false;
          }
        },
      });

      if (decision.isConfirmed) {
        void toast(
          'success',
          typeof decision.value === 'string'
            ? decision.value
            : 'Keanggotaan berhasil diproses.'
        );

        startTransition(() => router.refresh());
      }
    } catch {
      await toast(
        'error',
        'Dialog tidak dapat ditampilkan. Coba lagi.'
      );
    } finally {
      setBusy(false);
    }
  }

  function close() {
    if (!busy) {
      setMode(null);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || error) return;
    setBusy(true);
    try {
      const action = mode === 'invite' ? 'invite' : 'add';
      const result = await manageUserAction(action, {
        email, authUserId: uid, organizationId, role,
      });
      if (!result.ok) return void await toast('error', result.message);
      setMode(null);
      void toast('success', result.message);
      startTransition(() => router.refresh());
    } catch {
      await toast('error', 'Tidak dapat memproses permintaan.');
    } finally {
      setBusy(false);
    }
  }

  async function editRole(item: UserMember) {
    if (busy || item.protected || error) return;
    setBusy(true);
    try {
      const { default: Swal } = await import('sweetalert2');
      const decision = await Swal.fire({
        title: 'Ubah role anggota',
        text: `${item.email} • ${item.organization.name}`,
        icon: 'info',
        input: 'select',
        inputLabel: 'Role organisasi yang baru',
        inputOptions: Object.fromEntries(MEMBER_ROLES.map((key) => [key, names[key]])),
        inputValue: item.role,
        showCancelButton: true,
        confirmButtonText: 'Simpan perubahan',
        cancelButtonText: 'Batal',
        reverseButtons: true,
        focusCancel: true,
        customClass: {
          popup: 'lc-users-native-swal',
          confirmButton: 'lc-users-native-edit',
          cancelButton: 'lc-users-native-cancel',
        },
        showLoaderOnConfirm: true,
        allowOutsideClick: () => !Swal.isLoading(),
        allowEscapeKey: () => !Swal.isLoading(),
        preConfirm: async (value: unknown) => {
          const newRole = MEMBER_ROLES.find((key) => key === value);
          if (!newRole) {
            Swal.showValidationMessage('Pilih role organisasi yang valid.');
            return false;
          }
          if (newRole === item.role) {
            Swal.showValidationMessage('Pilih role berbeda dari yang saat ini.');
            return false;
          }
          try {
            const result = await manageUserAction('role', {
              membershipId: item.id,
              role: newRole,
            });
            if (!result.ok) {
              Swal.showValidationMessage(result.message);
              return false;
            }
            return result.message;
          } catch {
            Swal.showValidationMessage('Tidak dapat terhubung ke API. Coba lagi.');
            return false;
          }
        },
      });
      if (decision.isConfirmed) {
        void toast('success', typeof decision.value === 'string' ? decision.value : 'Role anggota diperbarui.');
        startTransition(() => router.refresh());
      }
    } catch {
      await toast('error', 'Dialog edit role tidak dapat ditampilkan.');
    } finally {
      setBusy(false);
    }
  }

  async function remove(item: UserMember) {
    if (busy || item.protected || error) return;
    setBusy(true);
    try {
      const { default: Swal } = await import('sweetalert2');
      const decision = await Swal.fire({
        title: 'Cabut keanggotaan?',
        text: `${item.email} tidak lagi memiliki akses ke ${item.organization.name}. Akun Supabase Auth tidak akan dihapus.`,
        icon: 'warning',
        input: 'text',
        inputLabel: `Ketik slug organisasi: ${item.organization.slug}`,
        inputPlaceholder: 'Konfirmasi slug organisasi',
        inputAttributes: { autocapitalize: 'off', autocomplete: 'off', spellcheck: 'false' },
        showCancelButton: true,
        confirmButtonText: 'Ya, cabut akses',
        cancelButtonText: 'Batal',
        reverseButtons: true,
        focusCancel: true,
        customClass: {
          popup: 'lc-users-native-swal',
          confirmButton: 'lc-users-native-danger',
          cancelButton: 'lc-users-native-cancel',
        },
        showLoaderOnConfirm: true,
        allowOutsideClick: () => !Swal.isLoading(),
        allowEscapeKey: () => !Swal.isLoading(),
        preConfirm: async (value: unknown) => {
          if (value !== item.organization.slug) {
            Swal.showValidationMessage('Slug organisasi belum cocok. Periksa kembali.');
            return false;
          }
          try {
            const result = await manageUserAction('remove', { membershipId: item.id });
            if (!result.ok) {
              Swal.showValidationMessage(result.message);
              return false;
            }
            return result.message;
          } catch {
            Swal.showValidationMessage('Gagal terhubung ke API. Coba lagi.');
            return false;
          }
        },
      });
      if (decision.isConfirmed) {
        void toast('success', typeof decision.value === 'string' ? decision.value : 'Akses organisasi dicabut.');
        startTransition(() => router.refresh());
      }
    } catch {
      await toast('error', 'Dialog pencabutan akses tidak dapat ditampilkan.');
    } finally {
      setBusy(false);
    }
  }
  function actions(item: UserMember) {
    const disabled = busy || item.protected || Boolean(error);
    return (
      <div className="flex items-center justify-end gap-1.5">
        <button type="button" disabled={disabled} onClick={() => void editRole(item)}
          aria-label={`Edit role ${item.email}`} title="Edit role anggota"
          className="group/action inline-flex h-9 w-9 items-center justify-center rounded-none border border-slate-200 bg-slate-50 text-slate-600 transition-colors duration-150 hover:bg-slate-200 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 disabled:cursor-not-allowed disabled:opacity-40">
          <SquarePen size={17} strokeWidth={1.8} className="transition-transform duration-200 group-hover/action:scale-110" />
        </button>
        <button type="button" disabled={disabled} onClick={() => void remove(item)}
          aria-label={`Cabut keanggotaan ${item.email}`} title="Cabut keanggotaan (bukan hapus akun)"
          className="group/action inline-flex h-9 w-9 items-center justify-center rounded-none border border-slate-200 bg-slate-50 text-slate-600 transition-colors duration-150 hover:bg-slate-200 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 disabled:cursor-not-allowed disabled:opacity-40">
          <UserRoundX size={17} strokeWidth={1.8} className="transition-transform duration-200 group-hover/action:scale-110" />
        </button>
      </div>
    );
  }
  function status(item: UserMember) {
    const label = item.protected
      ? 'Dilindungi'
      : item.banned
        ? 'Diblokir'
        : 'Anggota';

    return (
      <span className="inline-flex items-center gap-1.5 rounded-none border border-slate-200 bg-slate-100 px-3 py-1.5 text-[11px] font-semibold text-slate-700">
        <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
        {label}
      </span>
    );
  }

  // Role symbols replace fake initials; no profile photos are fabricated.
  function avatar(item: UserMember, size = 'h-10 w-10') {
    const Icon = item.role === 'SUPER_ADMIN' ? ShieldCheck : roleIcons[item.role];
    const tone = item.role === 'SUPER_ADMIN' ? 'bg-slate-100 text-slate-700' : roleAvatarTone[item.role];
    return (
      <span aria-hidden="true" className={`inline-flex shrink-0 items-center justify-center rounded-[13px] ring-1 ring-inset ring-white/75 shadow-sm ${size} ${tone}`}>
        <Icon size={21} strokeWidth={1.85} />
      </span>
    );
  }

  async function copyUid(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      void toast('success', 'UID pengguna berhasil disalin.');
    } catch {
      await toast('error', 'Gagal menyalin UID.');
    }
  }

  function copyIdAction(item: UserMember) {
    return (
      <button type="button" onClick={() => void copyUid(item.authUserId)}
        title="Salin UID lengkap" aria-label={`Salin UID ${item.email}`}
        className="inline-flex items-center gap-1 rounded-none px-1.5 py-1 text-[10px] font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-2 focus-visible:outline-slate-400">
        <Copy size={12} strokeWidth={1.9} /> Salin ID
      </button>
    );
  }
  return (
    <div data-ledgercore-users="true" className="space-y-5 pb-10 sm:space-y-6">
      <section data-ledgercore-users-header="notus-v5"
        className="rounded-md border border-[#e1e7f0] bg-[#f8fafc] px-[18px] py-[19px] shadow-[0_2px_8px_rgba(31,46,73,.025)] sm:px-5 sm:py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-[#8192af]">LedgerCore / Workspace / Administrasi</p>
            <h1 className="mt-2 text-[21px] font-extrabold tracking-tight text-[#293653] sm:text-[24px]">
              Manajemen Pengguna
            </h1>
            <p className="mt-2 max-w-2xl text-[12px] leading-5 text-[#71829e] sm:text-[13px]">
              Kelola akun, keanggotaan, dan role akses perusahaan.
            </p>
          </div>
          <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto lg:shrink-0 lg:justify-end">
            <button type="button" disabled={!available} onClick={() => open('add')}
              className="inline-flex h-10 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-[#d4deeb] bg-white px-4 text-[12px] font-semibold text-[#33435f] shadow-sm transition hover:-translate-y-0.5 hover:border-sky-300 hover:bg-sky-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none">
              <UserRoundPlus size={16} /> Tambah UID
            </button>
            <button type="button" disabled={!available} onClick={() => open('invite')}
              className="inline-flex h-10 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-[#29324d] px-4 text-[12px] font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#39476b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none">
              <MailPlus size={16} /> Undang Pengguna <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </section>
      {error && (
        <div role="alert" className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3.5 text-sm text-amber-900">
          <CircleHelp size={19} className="mt-0.5 shrink-0" />
          <p>{error}. Periksa koneksi API dan konfigurasi SUPABASE_SECRET_KEY pada backend.</p>
        </div>
      )}

      <section aria-label="Ringkasan anggota" className="grid gap-3 sm:grid-cols-3 sm:gap-4">
        {[
          { label: 'Total Keanggotaan', value: users.length, icon: Users, note: 'Akses organisasi tercatat', tone: 'bg-sky-50 text-sky-600', accent: 'bg-sky-500' },
          { label: 'Organisasi Tersedia', value: organizations.length, icon: Building2, note: 'Dari direktori organisasi', tone: 'bg-indigo-50 text-indigo-600', accent: 'bg-indigo-500' },
          { label: 'Role Organisasi', value: MEMBER_ROLES.length, icon: ShieldCheck, note: 'Jenis peran yang tersedia', tone: 'bg-emerald-50 text-emerald-600', accent: 'bg-emerald-500' },
        ].map((card) => (
          <article key={card.label} className={`${effects.statCard} relative overflow-hidden rounded-[20px] border border-[#e3eaf3] bg-white p-4 shadow-[0_5px_24px_rgba(34,51,88,.045)] sm:p-5`}>
            <span aria-hidden="true" className={`absolute left-0 top-5 h-12 w-[3px] rounded-r-full ${card.accent}`} />
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-slate-500">{card.label}</p>
                <p className="mt-3 text-[31px] font-extrabold leading-none tracking-tight text-[#192a45]">{card.value}</p>
              </div>
              <span className={`inline-flex h-11 w-11 items-center justify-center rounded-[14px] ${card.tone}`}><card.icon size={21} /></span>
            </div>
            <p className="mt-4 flex items-center gap-1.5 text-[11px] text-slate-400"><CheckCircle2 size={13} className="text-emerald-500" />{card.note}</p>
          </article>
        ))}
      </section>

      <section data-ledgercore-directory="minimal-v9" className="overflow-hidden rounded-[24px] border border-[#e2e9f2] bg-white shadow-[0_8px_30px_rgba(30,48,86,.045)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-5 sm:px-6">
          <div>
            <div className="flex items-center gap-2"><span className="inline-flex h-8 w-8 items-center justify-center rounded-none bg-slate-100 text-slate-600"><Users size={17} /></span><h2 className="text-[16px] font-extrabold tracking-tight text-[#20304b]">Direktori Pengguna</h2></div>
            <p className="mt-1.5 text-xs text-slate-500">Kelola akses dan keanggotaan tim secara terpusat.</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-bold text-slate-600">
            <span className="h-2 w-2 rounded-full bg-slate-500" /> {filtered.length} dari {users.length} data
          </span>
        </div>

        <div className="grid gap-3 border-b border-slate-100 bg-[#fcfdff] px-4 py-4 sm:px-6 lg:grid-cols-[minmax(190px,1fr)_minmax(145px,190px)_minmax(130px,170px)_minmax(128px,150px)]">
          <label className="relative block">
            <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input aria-label="Cari pengguna" type="search" value={search} onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari nama, email, atau role..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-[12px] text-[#2b3b59] outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100" />
          </label>
          <div className="relative">
            <Building2 size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select aria-label="Filter organisasi" value={filter} onChange={(event) => setFilter(event.target.value)}
              className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-9 pr-8 text-[12px] font-semibold text-slate-600 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100">
              <option value="all">Semua organisasi</option>
              {organizations.map((org) => <option value={org.id} key={org.id}>{org.name}</option>)}
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
          <div className="relative">
            <SlidersHorizontal size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select aria-label="Filter role" value={roleFilter} onChange={(event) => setRoleFilter(event.target.value as 'all' | MemberRole)}
              className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-9 pr-8 text-[12px] font-semibold text-slate-600 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100">
              <option value="all">Semua role</option>
              {MEMBER_ROLES.map((key) => <option key={key} value={key}>{names[key]}</option>)}
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
          <div className="relative">
            <select aria-label="Urutkan pengguna" value={sort} onChange={(event) => setSort(event.target.value as Sort)}
              className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-3 pr-8 text-[12px] font-semibold text-slate-600 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100">
              <option value="recent">Terbaru</option>
              <option value="name">Nama A–Z</option>
              <option value="role">Berdasar role</option>
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        {hasFilters && (
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-2.5 text-[11px] text-slate-500 sm:px-6">
            <span>Menampilkan {filtered.length} hasil sesuai filter</span>
            <button type="button" onClick={() => { setSearch(''); setFilter('all'); setRoleFilter('all'); setSort('recent'); }} className="inline-flex items-center gap-1.5 font-bold text-sky-700 hover:text-sky-900"><FilterX size={14} /> Reset filter</button>
          </div>
        )}

        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full min-w-[840px] border-collapse text-left">
            <thead className="border-b border-slate-100 bg-[#f9fbfe] text-[10px] font-bold uppercase tracking-[.12em] text-slate-400">
              <tr><th scope="col" className="py-3.5 pl-6 pr-4">Pengguna</th><th scope="col" className="px-4 py-3.5">Organisasi</th><th scope="col" className="px-4 py-3.5">Role Akses</th><th scope="col" className="px-4 py-3.5">Status</th><th scope="col" className="py-3.5 pl-4 pr-6 text-right">Aksi</th></tr>
            </thead>
            <tbody className="divide-y divide-[#edf1f6]">
              {filtered.map((item) => (
                <tr key={item.id} className="group transition-colors hover:bg-[#f7fbff]">
                  <td className="py-4 pl-6 pr-4">
                    <div className="flex min-w-0 items-center gap-3">
                      {avatar(item, 'h-11 w-11')}
                      <div className="min-w-0"><p className="max-w-[240px] truncate text-[12px] font-extrabold text-[#22314d]">{item.name || item.email}</p><p className="mt-1 max-w-[260px] truncate text-[11px] text-slate-500">{item.email}</p><div className="mt-0.5">{copyIdAction(item)}</div></div>
                    </div>
                  </td>
                  <td className="px-4 py-4"><span className="inline-flex items-center gap-2 text-[12px] font-semibold text-slate-600"><Building2 size={14} className="text-slate-400" />{item.organization.name}</span></td>
                  <td className="px-4 py-4"><span className={`inline-flex items-center rounded-lg px-2.5 py-1.5 text-[11px] font-bold ring-1 ring-inset ${badgeClass(item.role)}`}>{memberRoleLabel(item.role)}</span></td>
                  <td className="px-4 py-4">{status(item)}</td>
                  <td className="py-4 pl-4 pr-6">{actions(item)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="divide-y divide-slate-100 lg:hidden">
          {filtered.map((item) => (
            <article key={item.id} className="space-y-4 px-4 py-4 sm:px-6">
              <div className="flex items-start gap-3">
                {avatar(item, 'h-11 w-11')}
                <div className="min-w-0 flex-1"><p className="truncate text-[13px] font-bold text-[#22314d]">{item.name || item.email}</p><p className="mt-1 break-all text-[11px] text-slate-500">{item.email}</p><div className="mt-0.5">{copyIdAction(item)}</div></div>
                {actions(item)}
              </div>
              <div className="flex flex-wrap items-center gap-2 pl-0 sm:pl-14"><span className={`inline-flex rounded-lg px-2.5 py-1.5 text-[11px] font-bold ring-1 ring-inset ${badgeClass(item.role)}`}>{memberRoleLabel(item.role)}</span>{status(item)}</div>
              <div className="flex items-center gap-2 rounded-xl bg-[#f7faff] px-3 py-2 text-[11px] font-semibold text-slate-600"><Building2 size={14} className="text-sky-500" />{item.organization.name}</div>
            </article>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="px-5 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400"><Search size={25} /></div>
            <h3 className="mt-4 text-sm font-bold text-slate-700">Tidak ada pengguna yang cocok</h3>
            <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-400">Coba ubah filter atau tambahkan anggota organisasi jika daftar masih kosong.</p>
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-[#fcfdff] px-4 py-3 text-[10px] text-slate-400 sm:px-6">
          <span>Menampilkan maksimal 100 keanggotaan per permintaan API</span>
          <span className="inline-flex items-center gap-1.5"><LockKeyhole size={12} /> Cabut akses tidak menghapus akun Auth</span>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(260px,.6fr)]">
        <article className="rounded-[22px] border border-[#e2e9f2] bg-white px-5 py-5 shadow-[0_6px_24px_rgba(30,48,86,.04)] sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-sm font-extrabold text-[#253451]">Distribusi Role</h2><p className="mt-1 text-[11px] text-slate-500">Jumlah keanggotaan berdasarkan peran organisasi.</p></div><Sparkles size={19} className="text-sky-500" /></div>
          <div className="mt-5 grid gap-x-8 gap-y-4 sm:grid-cols-2">
            {roleCounts.map(({ role: key, count }) => (
              <div key={key}>
                <div className="mb-2 flex justify-between gap-3 text-[11px]"><span className="font-semibold text-slate-600">{names[key]}</span><span className="font-extrabold tabular-nums text-[#263754]">{count}</span></div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className={`${effects.progress} h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-400`} style={{ width: `${users.length ? Math.round((count / users.length) * 100) : 0}%` }} /></div>
              </div>
            ))}
          </div>
        </article>
        <article className="flex flex-col justify-between rounded-[22px] border border-[#dce9f8] bg-gradient-to-br from-[#eef7ff] to-[#f7faff] p-5 sm:p-6">
          <div><div className="flex h-10 w-10 items-center justify-center rounded-[13px] bg-white text-[#2563a6] shadow-sm"><Fingerprint size={20} /></div><h2 className="mt-4 text-sm font-extrabold text-[#263754]">Kontrol akses terpusat</h2><p className="mt-2 text-xs leading-6 text-slate-600">Keanggotaan organisasi bisa diatur di halaman ini. Izin modul tetap harus diverifikasi di backend, bukan hanya dari menu.</p></div>
          <div className="mt-5 flex items-center justify-between border-t border-sky-100 pt-4 text-[11px] font-semibold text-[#47668a]"><span>{totalNotBanned} keanggotaan tidak diblokir</span><ShieldCheck size={17} className="text-emerald-600" /></div>
        </article>
      </section>

      {mode && (
        <div className={`${effects.overlay} fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#111d33]/75 p-3 backdrop-blur-[5px] sm:p-5`}
          onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="user-modal-title" className={`${effects.dialog} my-auto w-full max-w-[490px] overflow-hidden rounded-[24px] bg-white shadow-[0_30px_90px_rgba(9,22,48,.32)]`}>
            <div className="relative overflow-hidden bg-gradient-to-br from-[#192845] via-[#23476a] to-[#1b85a6] px-6 py-6 text-white">
              <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-14 h-44 w-44 rounded-full border border-white/10 bg-white/5" />
              <div className="relative flex items-start justify-between gap-3">
                <div><span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[.18em] text-cyan-100"><KeyRound size={13} /> LedgerCore / Security</span><h2 id="user-modal-title" className="mt-2 text-[22px] font-extrabold tracking-tight">{mode === 'invite' ? 'Undang Pengguna' : 'Tambah Anggota'}</h2><p className="mt-1 text-xs text-slate-200">{mode === 'invite' ? 'Kirim undangan ke anggota tim baru.' : 'Hubungkan akun Supabase ke organisasi.'}</p></div>
                <button type="button" aria-label="Tutup modal" disabled={busy} onClick={close} className="rounded-xl border border-white/15 p-2 text-white/90 transition hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-cyan-200 disabled:opacity-40"><X size={19} /></button>
              </div>
            </div>
            <form onSubmit={(event) => void submit(event)} className="space-y-4 px-6 py-6">
              {mode === 'invite' && (
                <label className="block text-[12px] font-bold text-[#31415e]">Email pengguna
                  <input autoFocus type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nama@perusahaan.com"
                    className="mt-2 h-12 w-full rounded-xl border border-[#dce5f0] bg-[#fafcff] px-3.5 text-sm font-medium text-[#283953] outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100" />
                </label>
              )}
              {mode === 'add' && (
                <label className="block text-[12px] font-bold text-[#31415e]">Supabase User UID
                  <input autoFocus required pattern="[0-9a-fA-F-]{36}" value={uid} onChange={(event) => setUid(event.target.value)} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    className="mt-2 h-12 w-full rounded-xl border border-[#dce5f0] bg-[#fafcff] px-3.5 font-mono text-xs text-[#283953] outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100" />
                </label>
              )}
              <label className="block text-[12px] font-bold text-[#31415e]">Organisasi
                <select required value={organizationId} onChange={(event) => setOrganizationId(event.target.value)}
                  className="mt-2 h-12 w-full rounded-xl border border-[#dce5f0] bg-[#fafcff] px-3 text-sm text-[#283953] outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100">
                  {organizations.map((org) => <option value={org.id} key={org.id}>{org.name}</option>)}
                </select>
              </label>
              <label className="block text-[12px] font-bold text-[#31415e]">Role organisasi
                <select value={role} onChange={(event) => setRole(event.target.value as MemberRole)}
                  className="mt-2 h-12 w-full rounded-xl border border-[#dce5f0] bg-[#fafcff] px-3 text-sm text-[#283953] outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100">
                  {MEMBER_ROLES.map((key) => <option key={key} value={key}>{names[key]}</option>)}
                </select>
                <span className="mt-2 flex items-start gap-1.5 text-[11px] font-normal leading-4 text-slate-500"><LockKeyhole size={13} className="mt-0.5 shrink-0 text-sky-500" /> SUPER_ADMIN global tidak dapat diberikan dari form ini.</span>
              </label>
              <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button type="button" disabled={busy} onClick={close} className="h-11 rounded-xl border border-slate-200 bg-white px-5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-40">Batal</button>
                <button type="submit" disabled={busy} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#263e64] px-5 text-xs font-extrabold text-white shadow-md transition hover:bg-[#345480] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 disabled:cursor-not-allowed disabled:opacity-40">
                  {busy ? <LoaderCircle size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
                  {busy ? 'Memproses...' : mode === 'invite' ? 'Kirim Undangan' : 'Tambah Anggota'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
