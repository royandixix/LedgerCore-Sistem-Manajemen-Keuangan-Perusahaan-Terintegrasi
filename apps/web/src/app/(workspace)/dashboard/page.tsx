import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  Bell,
  BookOpen,
  Building2,
  CalendarRange,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  CreditCard,
  FileClock,
  FileText,
  LayoutDashboard,
  Layers3,
  LockKeyhole,
  LogOut,
  Menu,
  Receipt,
  Settings2,
  ShieldCheck,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { createClient } from "../../../lib/supabase/server";

type RoleCode =
  | "SUPER_ADMIN"
  | "FINANCE_ADMIN"
  | "ACCOUNTANT"
  | "FINANCE_MANAGER"
  | "AP_OFFICER"
  | "AR_OFFICER"
  | "AUDITOR";

interface DashboardUser {
  id: string;
  email: string | null;
  name: string | null;
  role: RoleCode;
}

interface ModuleItem {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
}

interface RoleConfig {
  title: string;
  description: string;
  modules: ModuleItem[];
}

const roleConfig: Record<RoleCode, RoleConfig> = {
  SUPER_ADMIN: {
    title: "Super Administrator",
    description:
      "Pusat kendali organisasi, pengguna, keamanan, dan konfigurasi LedgerCore.",
    modules: [
      {
        title: "Manajemen Organisasi",
        description: "Kelola struktur dan profil organisasi.",
        href: "/organizations",
        icon: Building2,
      },
      {
        title: "Manajemen Pengguna",
        description: "Kelola akun dan keanggotaan pengguna.",
        href: "/users",
        icon: Users,
      },
      {
        title: "Role & Permissions",
        description: "Atur peran dan kebijakan akses.",
        href: "/roles",
        icon: ShieldCheck,
      },
      {
        title: "Konfigurasi Sistem",
        description: "Pengaturan utama platform LedgerCore.",
        href: "/settings",
        icon: Settings2,
      },
    ],
  },
  FINANCE_ADMIN: {
    title: "Finance Administrator",
    description: "Kelola administrasi dan operasional transaksi keuangan.",
    modules: [
      {
        title: "Invoice",
        description: "Pengelolaan dokumen invoice.",
        href: "/invoices",
        icon: Receipt,
      },
      {
        title: "Pengeluaran",
        description: "Pencatatan transaksi pengeluaran.",
        href: "/expenses",
        icon: Wallet,
      },
      {
        title: "Piutang",
        description: "Pemantauan piutang perusahaan.",
        href: "/receivables",
        icon: CreditCard,
      },
      {
        title: "Laporan",
        description: "Akses laporan keuangan.",
        href: "/reports",
        icon: FileText,
      },
    ],
  },
  ACCOUNTANT: {
    title: "Accountant",
    description: "Kelola pencatatan dan pelaporan akuntansi.",
    modules: [
      {
        title: "Chart of Accounts",
        description: "Pengelolaan daftar akun.",
        href: "/accounts",
        icon: Layers3,
      },
      {
        title: "Jurnal Umum",
        description: "Pencatatan jurnal transaksi.",
        href: "/journals",
        icon: BookOpen,
      },
      {
        title: "Buku Besar",
        description: "Pemantauan transaksi per akun.",
        href: "/ledger",
        icon: FileText,
      },
      {
        title: "Periode Fiskal",
        description: "Pengelolaan periode akuntansi.",
        href: "/fiscal-periods",
        icon: CalendarRange,
      },
    ],
  },
  FINANCE_MANAGER: {
    title: "Finance Manager",
    description: "Pantau aktivitas dan persetujuan transaksi keuangan.",
    modules: [
      {
        title: "Persetujuan",
        description: "Tinjau permintaan persetujuan.",
        href: "/approvals",
        icon: ClipboardCheck,
      },
      {
        title: "Laporan Keuangan",
        description: "Tinjau hasil laporan keuangan.",
        href: "/reports",
        icon: FileText,
      },
      {
        title: "Rekonsiliasi",
        description: "Pencocokan catatan keuangan.",
        href: "/reconciliation",
        icon: Activity,
      },
      {
        title: "Pengeluaran",
        description: "Tinjau transaksi pengeluaran.",
        href: "/expenses",
        icon: CircleDollarSign,
      },
    ],
  },
  AP_OFFICER: {
    title: "Accounts Payable Officer",
    description: "Kelola kewajiban dan utang perusahaan.",
    modules: [
      {
        title: "Utang Usaha",
        description: "Pemantauan kewajiban pembayaran.",
        href: "/payables",
        icon: Wallet,
      },
      {
        title: "Pengeluaran",
        description: "Pencatatan pengeluaran.",
        href: "/expenses",
        icon: Receipt,
      },
    ],
  },
  AR_OFFICER: {
    title: "Accounts Receivable Officer",
    description: "Kelola piutang dan penagihan perusahaan.",
    modules: [
      {
        title: "Piutang Usaha",
        description: "Pantau tagihan pelanggan.",
        href: "/receivables",
        icon: CreditCard,
      },
      {
        title: "Invoice",
        description: "Akses dokumen penagihan.",
        href: "/invoices",
        icon: Receipt,
      },
    ],
  },
  AUDITOR: {
    title: "Auditor",
    description: "Lakukan peninjauan dan penelusuran aktivitas sistem.",
    modules: [
      {
        title: "Audit Trail",
        description: "Telusuri aktivitas sistem.",
        href: "/audit-trail",
        icon: FileClock,
      },
      {
        title: "Laporan",
        description: "Tinjau laporan perusahaan.",
        href: "/reports",
        icon: FileText,
      },
      {
        title: "Jurnal",
        description: "Tinjau pencatatan jurnal.",
        href: "/journals",
        icon: BookOpen,
      },
    ],
  },
};

async function logout() {
  "use server";

  const supabase = await createClient();

  const { error } = await supabase.auth.signOut({
    scope: "local",
  });

  if (error) {
    throw new Error("Gagal mengakhiri sesi.");
  }

  redirect("/login");
}

function AccessMessage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f7f3] px-6">
      <div className="w-full max-w-md rounded-3xl border border-[#e2e9e3] bg-white p-9 text-center shadow-sm">
        <ShieldCheck className="mx-auto text-[#63846b]" size={42} />
        <h1 className="mt-6 text-2xl font-bold text-[#172621]">{title}</h1>
        <p className="mt-4 text-sm leading-7 text-[#748078]">{description}</p>
        <form action={logout}>
          <button
            type="submit"
            className="mt-7 w-full rounded-xl bg-[#172621] px-5 py-4 text-sm font-semibold text-white transition hover:bg-[#284a3b]"
          >
            Keluar dari akun
          </button>
        </form>
      </div>
    </main>
  );
}

function Sidebar({
  role,
  modules,
}: {
  role: RoleConfig;
  modules: ModuleItem[];
}) {
  return (
    <aside className="flex w-full flex-col bg-[#142820] text-white lg:sticky lg:top-0 lg:h-screen lg:w-[268px] lg:shrink-0">
      <div className="border-b border-white/10 px-6 py-7">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d5f5ae] text-[#172621]">
            <Layers3 size={22} strokeWidth={2.4} />
          </div>
          <div>
            <p className="text-xl font-extrabold tracking-tight">
              ledgercore<span className="text-[#d5f5ae]">.</span>
            </p>
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">
              Financial Platform
            </p>
          </div>
        </Link>
      </div>

      <div className="flex-1 space-y-8 overflow-y-auto px-4 py-7">
        <div>
          <p className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">
            Workspace
          </p>

          <Link
            href="/dashboard"
            aria-current="page"
            className="flex items-center gap-3 rounded-xl bg-[#d5f5ae] px-4 py-3 text-sm font-bold text-[#172621]"
          >
            <LayoutDashboard size={18} />
            Dashboard
          </Link>
        </div>

        <div>
          <p className="mb-4 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-white/40">
            Menu Utama
          </p>

          <nav className="space-y-1">
            {modules.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-white/65 transition hover:bg-white/10 hover:text-white"
                >
                  <Icon size={18} />
                  <span className="flex-1">{item.title}</span>
                  <ChevronRight
                    size={14}
                    className="opacity-0 transition group-hover:opacity-100"
                  />
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-2 text-[#d5f5ae]">
            <LockKeyhole size={16} />
            <span className="text-xs font-bold">Akses Aktif</span>
          </div>
          <p className="mt-3 text-sm font-semibold">{role.title}</p>
          <p className="mt-2 text-xs leading-5 text-white/45">
            Akses halaman tetap mengikuti kebijakan otorisasi backend.
          </p>
        </div>
      </div>

      <div className="border-t border-white/10 p-4">
        <form action={logout}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <LogOut size={18} />
            Keluar dari akun
          </button>
        </form>
      </div>
    </aside>
  );
}

function DashboardView({
  user,
  role,
}: {
  user: DashboardUser;
  role: RoleConfig;
}) {
  const displayName = user.name || user.email || "Pengguna";
  const firstLetter = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#f5f7f3] text-[#172621] lg:flex">
      <Sidebar role={role} modules={role.modules} />

      <div className="min-w-0 flex-1">
        <header className="flex min-h-[88px] items-center justify-between gap-4 border-b border-[#e2e8e1] bg-white px-5 sm:px-8">
          <div className="flex items-center gap-4">
            <Menu
              className="hidden text-[#829087]"
              size={19}
              aria-hidden="true"
            />
            <div>
              <p className="text-xs text-[#829087]">Workspace / Overview</p>
              <h1 className="mt-1 text-lg font-bold">Dashboard</h1>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e4eae3] text-[#6e8374]"
              title="Status notifikasi belum terhubung"
              aria-label="Notifikasi belum terhubung"
            >
              <Bell size={18} />
            </div>

            <div className="hidden text-right sm:block">
              <p className="max-w-[230px] truncate text-sm font-semibold">
                {displayName}
              </p>
              <p className="mt-1 text-xs text-[#829087]">{role.title}</p>
            </div>

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#dceccf] font-bold text-[#294a37]">
              {firstLetter}
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1600px] space-y-8 p-5 sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#719079]">
                Control Center
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                Selamat datang di LedgerCore
              </h2>
              <p className="mt-2 text-sm text-[#7a8a80]">
                Workspace terintegrasi untuk pengelolaan sistem dan keuangan.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-[#dce7dc] bg-white px-4 py-2 text-xs font-semibold text-[#426a4d]">
              <CheckCircle2 size={15} />
              Sesi terverifikasi
            </div>
          </div>

          <section className="relative overflow-hidden rounded-[28px] bg-[#172e24] p-7 text-white sm:p-10">
            <div className="pointer-events-none absolute -right-24 -top-36 h-96 w-96 rounded-full border border-white/10" />
            <div className="pointer-events-none absolute -right-12 -top-24 h-72 w-72 rounded-full border border-white/10" />
            <div className="pointer-events-none absolute -bottom-40 right-32 h-72 w-72 rounded-full bg-[#a9d780]/10 blur-3xl" />

            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#d5f5ae]/20 bg-[#d5f5ae]/10 px-4 py-2 text-[11px] font-bold tracking-wider text-[#d5f5ae]">
                <ShieldCheck size={15} />
                {user.role.replaceAll("_", " ")}
              </div>

              <h3 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
                Satu workspace.
                <span className="block text-[#d5f5ae]">
                  Kendali lebih terarah.
                </span>
              </h3>

              <p className="mt-5 max-w-xl text-sm leading-7 text-white/60">
                {role.description}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href={role.modules[0].href}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#d5f5ae] px-5 py-3 text-sm font-bold text-[#172621] transition hover:bg-white"
                >
                  Buka Workspace
                  <ArrowUpRight size={17} />
                </Link>

                <span className="inline-flex items-center gap-2 px-2 text-xs text-white/55">
                  <LockKeyhole size={15} />
                  Identitas dan role diverifikasi
                </span>
              </div>
            </div>
          </section>

          <section>
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold">Akses Cepat</h3>
                <p className="mt-2 text-sm text-[#7b8c80]">
                  Navigasi modul berdasarkan role akun Anda.
                </p>
              </div>
              <span className="text-xs font-semibold text-[#6e8772]">
                {role.modules.length} Modul
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {role.modules.map((item, index) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group flex min-h-[220px] flex-col rounded-2xl border border-[#e2e8e1] bg-white p-6 transition duration-200 hover:-translate-y-1 hover:border-[#adc9a8] hover:shadow-xl hover:shadow-[#17352a]/5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eaf2e4] text-[#3e7653] transition group-hover:bg-[#d5f5ae]">
                        <Icon size={23} />
                      </div>
                      <span className="text-xs font-bold text-[#a3b2a5]">
                        0{index + 1}
                      </span>
                    </div>

                    <h4 className="mt-6 font-bold">{item.title}</h4>

                    <p className="mt-2 flex-1 text-xs leading-6 text-[#819087]">
                      {item.description}
                    </p>

                    <div className="mt-5 flex items-center gap-2 text-xs font-bold text-[#4c8158]">
                      Buka halaman
                      <ArrowRight
                        size={15}
                        className="transition group-hover:translate-x-1"
                      />
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          <div className="grid gap-5 xl:grid-cols-3">
            <section className="rounded-2xl border border-[#e2e8e1] bg-white p-6 xl:col-span-2">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-[#eaf2e4] p-3 text-[#4b7d57]">
                  <Activity size={21} />
                </div>
                <div>
                  <h3 className="font-bold">Aktivitas Sistem</h3>
                  <p className="mt-1 text-xs text-[#819087]">
                    Riwayat aktivitas dan audit sistem.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex min-h-[135px] flex-col items-center justify-center rounded-xl border border-dashed border-[#dce6d9] bg-[#fafcf9] p-5 text-center">
                <FileClock size={26} className="text-[#91a693]" />
                <p className="mt-3 text-sm font-semibold">
                  Data aktivitas belum dimuat
                </p>
                <p className="mt-2 text-xs text-[#819087]">
                  Buka Audit Trail untuk memeriksa aktivitas yang tersedia.
                </p>
              </div>

              {user.role === "SUPER_ADMIN" || user.role === "AUDITOR" ? (
                <Link
                  href="/audit-trail"
                  className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-[#4b8058]"
                >
                  Lihat Audit Trail
                  <ArrowUpRight size={15} />
                </Link>
              ) : null}
            </section>

            <section className="rounded-2xl border border-[#e2e8e1] bg-white p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-[#eaf2e4] p-3 text-[#4b7d57]">
                  <ShieldCheck size={21} />
                </div>
                <div>
                  <h3 className="font-bold">Keamanan Akun</h3>
                  <p className="mt-1 text-xs text-[#819087]">
                    Informasi akses saat ini.
                  </p>
                </div>
              </div>

              <div className="mt-7 space-y-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-[#819087]">Autentikasi</span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-[#4c8058]">
                    <CheckCircle2 size={14} />
                    Valid
                  </span>
                </div>

                <div className="h-px bg-[#edf1eb]" />

                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-[#819087]">Role aktif</span>
                  <span className="text-right text-xs font-bold">
                    {role.title}
                  </span>
                </div>

                <div className="h-px bg-[#edf1eb]" />

                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-[#819087]">Akses modul</span>
                  <span className="text-xs font-bold">
                    {role.modules.length} menu
                  </span>
                </div>
              </div>

              <div className="mt-7 rounded-xl bg-[#eef5e9] p-4 text-xs leading-6 text-[#4c7653]">
                Akses workspace divalidasi melalui backend LedgerCore.
              </div>
            </section>
          </div>

          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e1e8df] py-5 text-xs text-[#8b998d]">
            <p>© LedgerCore — Enterprise Financial Platform</p>
            <p>Secure Workspace</p>
          </footer>
        </main>
      </div>
    </div>
  );
}

async function DashboardContent() {
  const supabase = await createClient();

  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims) {
    redirect("/login");
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    redirect("/login");
  }

  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:4000/api/v1";

  const response = await fetch(`${apiUrl}/auth/dashboard-access`, {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
    cache: "no-store",
  }).catch(() => null);

  if (!response) {
    return (
      <AccessMessage
        title="Backend tidak tersedia"
        description="Pastikan server NestJS LedgerCore sedang berjalan."
      />
    );
  }

  if (response.status === 401) {
    return (
      <AccessMessage
        title="Sesi tidak valid"
        description="Silakan keluar dan masuk kembali."
      />
    );
  }

  if (response.status === 403) {
    return (
      <AccessMessage
        title="Menunggu hak akses"
        description="Akun belum mendapatkan role aktif."
      />
    );
  }

  if (!response.ok) {
    return (
      <AccessMessage
        title="Gagal memuat dashboard"
        description="Terjadi kendala pada layanan LedgerCore."
      />
    );
  }

  const result = (await response.json()) as {
    status: string;
    user: DashboardUser;
  };

  const user = result.user;

  if (
    result.status !== "authorized" ||
    !user ||
    !Object.hasOwn(roleConfig, user.role)
  ) {
    return (
      <AccessMessage
        title="Hak akses tidak tersedia"
        description="Role akun belum dikenali oleh sistem."
      />
    );
  }

  return <DashboardView user={user} role={roleConfig[user.role]} />;
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-sm text-[#63846b]">
          Memverifikasi akses LedgerCore...
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
