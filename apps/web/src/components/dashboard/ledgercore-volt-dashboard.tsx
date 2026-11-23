"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bell,
  BookOpen,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Copy,
  CreditCard,
  Download,
  FileCheck2,
  FileClock,
  FileText,
  Layers3,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Menu,
  Receipt,
  Search,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Users,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";

export type RoleCode =
  | "SUPER_ADMIN"
  | "FINANCE_ADMIN"
  | "ACCOUNTANT"
  | "FINANCE_MANAGER"
  | "AP_OFFICER"
  | "AR_OFFICER"
  | "AUDITOR";

type Area = "Administrasi" | "Akuntansi" | "Operasional" | "Pelaporan";
type ModuleItem = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  roles: readonly RoleCode[];
  area: Area;
};

const ROLE_LABEL: Record<RoleCode, string> = {
  SUPER_ADMIN: "Super Administrator",
  FINANCE_ADMIN: "Finance Administrator",
  ACCOUNTANT: "Accountant",
  FINANCE_MANAGER: "Finance Manager",
  AP_OFFICER: "Accounts Payable Officer",
  AR_OFFICER: "Accounts Receivable Officer",
  AUDITOR: "Auditor",
};

// Daftar menu ini membantu navigasi, bukan pengganti otorisasi di backend.
const MODULES: ModuleItem[] = [
  { title: "Organisasi", description: "Profil dan daftar perusahaan", href: "/organizations", icon: Building2, roles: ["SUPER_ADMIN"], area: "Administrasi" },
  { title: "Pengguna", description: "Akun dan keanggotaan", href: "/users", icon: Users, roles: ["SUPER_ADMIN"], area: "Administrasi" },
  { title: "Role & Permissions", description: "Pengaturan kewenangan", href: "/roles", icon: ShieldCheck, roles: ["SUPER_ADMIN"], area: "Administrasi" },
  { title: "Pengaturan", description: "Konfigurasi platform", href: "/settings", icon: Settings2, roles: ["SUPER_ADMIN", "FINANCE_ADMIN"], area: "Administrasi" },
  { title: "Audit Trail", description: "Jejak aktivitas sistem", href: "/audit-trail", icon: FileClock, roles: ["SUPER_ADMIN", "AUDITOR"], area: "Pelaporan" },
  { title: "Chart of Accounts", description: "Daftar dan kode akun", href: "/accounts", icon: Wallet, roles: ["SUPER_ADMIN", "FINANCE_ADMIN", "ACCOUNTANT", "AUDITOR"], area: "Akuntansi" },
  { title: "Periode Fiskal", description: "Periode pembukuan", href: "/fiscal-periods", icon: CalendarDays, roles: ["SUPER_ADMIN", "FINANCE_ADMIN", "ACCOUNTANT"], area: "Akuntansi" },
  { title: "Jurnal Umum", description: "Entri jurnal akuntansi", href: "/journals", icon: BookOpen, roles: ["SUPER_ADMIN", "FINANCE_ADMIN", "ACCOUNTANT"], area: "Akuntansi" },
  { title: "Buku Besar", description: "Rincian transaksi akun", href: "/ledger", icon: Layers3, roles: ["SUPER_ADMIN", "FINANCE_ADMIN", "ACCOUNTANT", "FINANCE_MANAGER", "AUDITOR"], area: "Akuntansi" },
  { title: "Persetujuan", description: "Tinjauan transaksi", href: "/approvals", icon: ClipboardCheck, roles: ["SUPER_ADMIN", "FINANCE_ADMIN", "FINANCE_MANAGER"], area: "Operasional" },
  { title: "Pengeluaran", description: "Beban dan biaya", href: "/expenses", icon: Receipt, roles: ["SUPER_ADMIN", "FINANCE_ADMIN", "AP_OFFICER"], area: "Operasional" },
  { title: "Invoice", description: "Tagihan pelanggan", href: "/invoices", icon: FileText, roles: ["SUPER_ADMIN", "FINANCE_ADMIN", "AR_OFFICER"], area: "Operasional" },
  { title: "Utang Usaha", description: "Tagihan pemasok", href: "/payables", icon: CreditCard, roles: ["SUPER_ADMIN", "FINANCE_ADMIN", "FINANCE_MANAGER", "AP_OFFICER"], area: "Operasional" },
  { title: "Piutang Usaha", description: "Tagihan yang diterima", href: "/receivables", icon: Wallet, roles: ["SUPER_ADMIN", "FINANCE_ADMIN", "FINANCE_MANAGER", "AR_OFFICER"], area: "Operasional" },
  { title: "Rekonsiliasi", description: "Pencocokan pembukuan", href: "/reconciliation", icon: FileCheck2, roles: ["SUPER_ADMIN", "FINANCE_ADMIN", "ACCOUNTANT"], area: "Akuntansi" },
  { title: "Laporan Keuangan", description: "Ringkasan dan analitik", href: "/reports", icon: BarChart3, roles: ["SUPER_ADMIN", "FINANCE_ADMIN", "FINANCE_MANAGER", "ACCOUNTANT", "AUDITOR"], area: "Pelaporan" },
];

const AREAS: Area[] = ["Administrasi", "Akuntansi", "Operasional", "Pelaporan"];
const AREA_COLORS: Record<Area, string> = {
  Administrasi: "#169bd0",
  Akuntansi: "#1a9c8d",
  Operasional: "#5e74ce",
  Pelaporan: "#d89932",
};

const WEEK_AXIS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
const MONTH_AXIS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul"];
const CHART_PATHS = {
  minggu: "M 26 222 C 100 218, 111 172, 178 172 S 298 175, 331 172 S 427 119, 492 119 S 616 121, 648 119 S 740 51, 818 51 S 929 89, 977 117",
  bulan: "M 26 210 C 94 172, 120 183, 178 139 S 295 153, 331 125 S 422 165, 492 124 S 604 78, 648 95 S 750 48, 818 77 S 912 66, 977 43",
};

function formatRole(role: RoleCode) {
  return ROLE_LABEL[role];
}

export default function LedgercoreVoltDashboard({
  email,
  role,
  logoutAction,
  children,
}: {
  email: string;
  role: RoleCode;
  logoutAction: () => Promise<void>;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const isDashboard = pathname === "/dashboard" || pathname === "/dashboard/";
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState<"minggu" | "bulan">("minggu");
  const [showAll, setShowAll] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [feedback, setFeedback] = useState("");

  const allowed = useMemo(() => MODULES.filter((item) => item.roles.includes(role)), [role]);
  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("id-ID");
    return allowed.filter((item) => `${item.title} ${item.description} ${item.area}`.toLocaleLowerCase("id-ID").includes(query));
  }, [allowed, search]);
  const visibleRows = showAll ? filtered : filtered.slice(0, 5);
  const initials = email.split("@")[0]?.slice(0, 2).toUpperCase() || "LC";
  const axis = period === "minggu" ? WEEK_AXIS : MONTH_AXIS;
  const chartPath = CHART_PATHS[period];
  const accessibleByArea = AREAS.map((area) => ({
    area,
    count: allowed.filter((item) => item.area === area).length,
  }));
  const maxAreaCount = Math.max(1, ...accessibleByArea.map((item) => item.count));
  const accessPercentage = Math.round((allowed.length / MODULES.length) * 100);

  async function shareDashboard() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setFeedback("Tautan dashboard berhasil disalin.");
    } catch {
      setFeedback("Tidak dapat menyalin tautan. Silakan salin alamat browser.");
    }
  }

  function exportModules() {
    const csvCell = (value: string) => `"${value.replaceAll('"', '""')}"`;
    const rows = [
      ["Modul", "Area", "Deskripsi", "Route"],
      ...filtered.map((item) => [item.title, item.area, item.description, item.href]),
    ];
    const csv = `\ufeff${rows.map((row) => row.map(csvCell).join(",")).join("\r\n")}`;
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "ledgercore-daftar-modul.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setFeedback("Daftar modul berhasil diekspor ke CSV, bukan data keuangan.");
  }

  return (
    <div className="min-h-screen bg-[#f3f5f9] font-sans text-[#29324b]">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Tutup navigasi"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-[#111827]/65 lg:hidden"
        />
      )}

      <aside
        aria-label="Navigasi LedgerCore"
        className={`fixed inset-y-0 left-0 z-50 flex w-[232px] flex-col bg-[#272c43] text-[#eaedf8] shadow-xl transition-transform duration-200 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-[76px] shrink-0 items-center justify-between px-[22px]">
          <Link href="/dashboard" className="flex items-center gap-3 text-[16px] font-semibold tracking-tight text-white" onClick={() => setSidebarOpen(false)}>
            <span className="grid size-7 place-items-center text-[#3ebbe7]"><Layers3 size={24} /></span>
            LedgerCore
          </Link>
          <button type="button" className="rounded-lg p-1.5 hover:bg-white/10 lg:hidden" aria-label="Tutup menu" onClick={() => setSidebarOpen(false)}><X size={19} /></button>
        </div>

        <nav className="min-h-0 flex-1 space-y-0.5 overflow-y-auto px-[22px] pb-5" aria-label="Menu utama">
          <Link href="/dashboard" onClick={() => setSidebarOpen(false)} aria-current={isDashboard ? "page" : undefined} className={`mb-2 flex h-10 items-center gap-3 rounded-[6px] px-3 text-[13px] font-medium text-white ${isDashboard ? "border border-[#4b557b] bg-[#333d60]" : "border border-transparent hover:bg-[#36415f]"}`} >
            <LayoutDashboard size={17} /> Overview
          </Link>
          <p className="mb-3 mt-5 px-3 text-[10px] font-bold uppercase tracking-[.14em] text-[#9fa9c6]">Workspace</p>
          {allowed.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                aria-current={pathname === item.href ? "page" : undefined}
                className={`flex min-h-10 items-center gap-3 rounded-md px-3 py-2 text-[12px] font-medium transition-colors hover:bg-[#36415f] hover:text-white ${pathname === item.href ? "bg-[#333d60] text-white ring-1 ring-[#4b557b]" : "text-[#d7dbea]"}`}
              >
                <Icon size={16} className="shrink-0" />
                <span className="min-w-0 flex-1 truncate">{item.title}</span>
              </Link>
            );
          })}
        </nav>
        <div className="shrink-0 border-t border-white/10 px-[22px] py-4">
          <div className="mb-3 flex items-center gap-2.5 text-[#cdd6ef]"><LockKeyhole size={15} className="text-[#72d3c0]" /><span className="truncate text-[11px]">{formatRole(role)}</span></div>
          <form action={logoutAction}>
            <button type="submit" className="flex w-full items-center gap-2 rounded-md border border-white/15 px-3 py-2 text-[12px] font-semibold text-white transition hover:bg-white/10"><LogOut size={15} /> Keluar</button>
          </form>
        </div>
      </aside>

      <div className="flex min-h-screen min-w-0 flex-col lg:ml-[232px]">
        <header className="sticky top-0 z-30 border-b border-[#e4e9f1] bg-white">
          <div className="mx-auto flex min-h-[76px] max-w-[1680px] items-center gap-3 px-4 sm:px-6">
            <button type="button" aria-label="Buka navigasi" onClick={() => setSidebarOpen(true)} className="grid size-10 shrink-0 place-items-center rounded-md border border-[#e3e9f1] text-[#33415f] lg:hidden"><Menu size={20} /></button>
            <div className="relative w-full min-w-0 max-w-[285px] sm:max-w-[340px]">
              <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#91a5c3]" />
              <input
                aria-label="Cari modul"
                type="search"
                placeholder="Cari modul..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-11 w-full rounded-md border border-[#d9e0eb] bg-white pl-11 pr-4 text-[13px] text-[#344469] outline-none placeholder:text-[#7d8eb0] focus:border-[#32b6e5] focus:ring-2 focus:ring-[#32b6e5]/20"
              />
              {search.trim() !== "" && (
                <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 max-h-72 overflow-y-auto rounded-lg border border-[#e0e5ed] bg-white p-1.5 shadow-xl">
                  <div className="px-3 py-2 text-[11px] text-[#8290a8]">{filtered.length} modul ditemukan</div>
                  {filtered.slice(0, 6).map((item) => <Link key={item.href} href={item.href} className="flex items-center justify-between rounded-md px-3 py-2 text-[12px] hover:bg-[#f1f6fb]" onClick={() => setSearch("")}>{item.title}<ArrowRight size={14} /></Link>)}
                  {filtered.length === 0 && <p className="px-3 py-3 text-xs text-[#8490a8]">Tidak ada modul yang sesuai.</p>}
                </div>
              )}
            </div>
            <div className="ml-auto flex shrink-0 items-center gap-3 sm:gap-5">
              <div className="relative">
                <button type="button" aria-label="Lihat notifikasi" aria-expanded={notificationOpen} onClick={() => setNotificationOpen((open) => !open)} className="grid size-9 place-items-center rounded-full text-[#27304b] hover:bg-[#eef3f9]"><Bell size={19} /></button>
                {notificationOpen && (
                  <div className="absolute right-0 top-12 z-50 w-[min(290px,85vw)] rounded-lg border border-[#e1e7f0] bg-white p-4 shadow-xl">
                    <div className="mb-2 flex items-center justify-between text-sm font-bold"><span>Notifikasi</span><button type="button" onClick={() => setNotificationOpen(false)} aria-label="Tutup notifikasi" className="text-[#74819a]"><X size={15} /></button></div>
                    <p className="text-xs leading-5 text-[#7786a0]">Belum ada notifikasi yang tersedia dari API.</p>
                  </div>
                )}
              </div>
              <div className="grid size-10 shrink-0 place-items-center rounded-full bg-[#e9edf7] text-[12px] font-extrabold text-[#404d78]">{initials}</div>
              <div className="hidden min-w-0 sm:block">
                <p className="max-w-[185px] truncate text-[12px] font-semibold text-[#2c3551]">{email}</p>
                <p className="max-w-[185px] truncate text-[10px] text-[#8793ad]">{formatRole(role)}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto flex w-full max-w-[1680px] flex-1 flex-col space-y-[22px] px-4 pb-10 pt-5 sm:px-6">
          {isDashboard ? (
            <>
          <section className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold text-[#8090aa]">LedgerCore / Dashboard</p>
              <h1 className="mt-1 text-[23px] font-bold tracking-tight text-[#29314b]">Overview</h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link href={allowed[0]?.href ?? "/dashboard"} className="inline-flex h-9 items-center gap-1.5 rounded-md bg-[#282f47] px-3 text-[12px] font-semibold text-white hover:bg-[#374361]"><span className="text-lg leading-none">+</span> Buka modul</Link>
              <button type="button" onClick={shareDashboard} className="inline-flex h-9 items-center gap-2 rounded-md border border-[#d0d7e2] bg-white px-3 text-[12px] font-semibold text-[#2f3955] hover:bg-[#f6f9fc]"><Copy size={14} /> <span className="hidden sm:inline">Bagikan</span></button>
              <button type="button" onClick={exportModules} className="inline-flex h-9 items-center gap-2 rounded-md border border-[#d0d7e2] bg-white px-3 text-[12px] font-semibold text-[#2f3955] hover:bg-[#f6f9fc]"><Download size={14} /> Ekspor</button>
            </div>
          </section>

          {feedback && <div role="status" className="flex items-center justify-between gap-3 rounded-md border border-[#bddce9] bg-[#e8f8ff] px-4 py-2 text-[12px] text-[#31546c]"><span>{feedback}</span><button type="button" aria-label="Tutup pesan" onClick={() => setFeedback("")}><X size={16} /></button></div>}

          <section aria-label="Ringkasan finansial" className="overflow-hidden rounded-[7px] border border-[#8edaf4] bg-[#b0eafb]">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#8cd6ed] px-5 py-5 sm:px-[22px]">
              <div>
                <p className="text-[17px] font-medium text-[#273450]">Ringkasan Finansial</p>
                <p className="mt-1 text-[28px] font-semibold leading-tight tracking-tight text-[#28364e]">—</p>
                <p className="mt-2 text-[11px] text-[#3a5c73]">Belum ada data transaksi terintegrasi</p>
              </div>
              <div className="flex gap-1 rounded-md bg-white/20 p-1">
                <button type="button" aria-pressed={period === "bulan"} onClick={() => setPeriod("bulan")} className={`rounded-md px-3 py-2 text-[11px] font-semibold transition ${period === "bulan" ? "bg-[#25314d] text-white" : "bg-[#64d1f5] text-[#20334b] hover:bg-[#53c8ee]"}`}>Bulan</button>
                <button type="button" aria-pressed={period === "minggu"} onClick={() => setPeriod("minggu")} className={`rounded-md px-3 py-2 text-[11px] font-semibold transition ${period === "minggu" ? "bg-[#25314d] text-white" : "bg-[#64d1f5] text-[#20334b] hover:bg-[#53c8ee]"}`}>Minggu</button>
              </div>
            </div>
            <div className="relative px-4 pb-3 pt-3 sm:px-5">
              <div className="pointer-events-none absolute left-7 top-4 z-10 rounded-md border border-white/40 bg-white/45 px-2.5 py-1.5 text-[10px] font-medium text-[#346c84]">Ilustrasi grafik · bukan data aktual</div>
              <svg viewBox="0 0 1000 275" preserveAspectRatio="none" aria-hidden="true" className="h-[240px] w-full sm:h-[290px] lg:h-[320px]">
                <defs><linearGradient id="lcHeroFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1aa2d5" stopOpacity=".11" /><stop offset="100%" stopColor="#1aa2d5" stopOpacity=".01" /></linearGradient></defs>
                {axis.map((label, index) => <line key={label} x1={26 + index * 158.5} x2={26 + index * 158.5} y1="14" y2="253" stroke="#39bdec" strokeWidth="1" strokeDasharray="2 3" opacity=".72" />)}
                <path d={`${chartPath} L977 253 L26 253 Z`} fill="url(#lcHeroFill)" />
                <path d={chartPath} stroke="#139cca" fill="none" strokeWidth="2.6" vectorEffect="non-scaling-stroke" strokeLinecap="round" />
                {(period === "minggu" ? [[26,222],[178,172],[331,172],[492,119],[648,119],[818,51],[977,117]] : [[26,210],[178,139],[331,125],[492,124],[648,95],[818,77],[977,43]]).map(([x,y], index) => <circle key={index} cx={x} cy={y} r="4.2" fill="#159ccc" />)}
              </svg>
              <div className="grid grid-cols-7 px-1 text-center text-[10px] font-semibold text-[#356e84]">{axis.map((label) => <span key={label}>{label}</span>)}</div>
            </div>
          </section>

          <section aria-label="Indikator LedgerCore" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <article className="flex min-h-[125px] items-center gap-5 rounded-md border border-[#e1e6ee] bg-white px-5 py-4 shadow-[0_2px_8px_rgba(29,42,67,.025)]">
              <div className="grid size-14 shrink-0 place-items-center rounded-lg bg-[#eef2fb] text-[#515b87]"><Building2 size={27} /></div><div><p className="text-[15px] font-semibold">Organisasi</p><p className="mt-1 text-[24px] font-semibold">—</p><p className="mt-1 text-[11px] text-[#7988a2]">Menunggu koneksi data</p></div>
            </article>
            <article className="flex min-h-[125px] items-center gap-5 rounded-md border border-[#e1e6ee] bg-white px-5 py-4 shadow-[0_2px_8px_rgba(29,42,67,.025)]">
              <div className="grid size-14 shrink-0 place-items-center rounded-lg bg-[#eef2fb] text-[#515b87]"><BarChart3 size={27} /></div><div><p className="text-[15px] font-semibold">Transaksi Tercatat</p><p className="mt-1 text-[24px] font-semibold">—</p><p className="mt-1 text-[11px] text-[#7988a2]">Menunggu modul transaksi</p></div>
            </article>
            <article className="flex min-h-[125px] items-center gap-5 rounded-md border border-[#e1e6ee] bg-white px-5 py-4 shadow-[0_2px_8px_rgba(29,42,67,.025)] sm:col-span-2 xl:col-span-1">
              <div className="grid size-14 shrink-0 place-items-center rounded-lg bg-[#eef2fb] text-[#515b87]"><ShieldCheck size={27} /></div><div><p className="text-[15px] font-semibold">Modul Navigasi</p><p className="mt-1 text-[24px] font-semibold">{allowed.length}</p><p className="mt-1 text-[11px] text-[#139b84]">Sesuai role akun aktif</p></div>
            </article>
          </section>

          <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.95fr)_minmax(300px,.95fr)]">
            <div className="min-w-0 space-y-5">
              <section className="overflow-hidden rounded-md border border-[#e1e6ee] bg-white shadow-sm">
                <div className="flex items-center justify-between gap-3 px-5 py-4">
                  <h2 className="text-[16px] font-semibold">Modul LedgerCore</h2>
                  <button type="button" onClick={() => setShowAll((value) => !value)} className="rounded-md bg-[#59d5f8] px-3 py-1.5 text-[11px] font-semibold text-[#17415a] hover:bg-[#41c8f1]">{showAll ? "Lebih sedikit" : "Lihat semua"}</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-[545px] w-full text-left">
                    <thead className="border-y border-[#e6ebf1] bg-[#f7f9fb] text-[10px] font-semibold uppercase text-[#2c3552]"><tr><th scope="col" className="px-5 py-3">Modul</th><th scope="col" className="px-4 py-3">Area</th><th scope="col" className="px-4 py-3">Kegunaan</th><th scope="col" className="px-4 py-3 text-right">Akses</th></tr></thead>
                    <tbody>
                      {visibleRows.map((item) => <tr key={item.href} className="border-b border-[#edf0f4] text-[12px] hover:bg-[#f8fbff]"><td className="px-5 py-4 font-semibold text-[#2e3b5a]">{item.title}</td><td className="px-4 py-4 text-[#5e7195]">{item.area}</td><td className="px-4 py-4 text-[#73839d]">{item.description}</td><td className="px-4 py-4 text-right"><Link href={item.href} className="inline-flex items-center gap-1 font-semibold text-[#128db6] hover:underline">Buka <ArrowRight size={13} /></Link></td></tr>)}
                      {visibleRows.length === 0 && <tr><td colSpan={4} className="px-5 py-10 text-center text-[12px] text-[#8895ab]">Tidak ditemukan modul sesuai pencarian.</td></tr>}
                    </tbody>
                  </table>
                </div>
                <p className="px-5 py-3 text-[10px] text-[#8994a8]">Menu merupakan navigasi; fitur modul sedang diimplementasikan bertahap.</p>
              </section>

              <div className="grid items-start gap-5 md:grid-cols-2">
                <section className="rounded-md border border-[#e1e6ee] bg-white shadow-sm">
                  <div className="flex items-center justify-between border-b border-[#ebeff4] px-5 py-4"><h2 className="text-[16px] font-semibold">Akses cepat</h2><span className="text-[11px] text-[#8d9cb1]">{Math.min(4, allowed.length)} menu</span></div>
                  <div className="space-y-1 p-3">{allowed.slice(0, 4).map((item) => { const Icon=item.icon; return <Link href={item.href} key={item.href} className="flex items-center gap-3 rounded-lg px-3 py-3 text-[12px] hover:bg-[#f4f8fc]"><span className="grid size-9 place-items-center rounded-md bg-[#eaf1fc] text-[#596fbb]"><Icon size={18} /></span><span className="min-w-0 flex-1 truncate font-semibold">{item.title}</span><ChevronRight size={16} className="text-[#8fa0b6]" /></Link>; })}</div>
                </section>
                <section className="rounded-md border border-[#e1e6ee] bg-white shadow-sm">
                  <div className="flex items-center justify-between border-b border-[#ebeff4] px-5 py-4"><h2 className="text-[16px] font-semibold">Ruang Kerja</h2><Activity size={18} className="text-[#8391ac]" /></div>
                  <div className="space-y-4 px-5 py-5 text-[12px]">
                    <div className="flex items-start gap-3"><CheckCircle2 size={18} className="shrink-0 text-[#16a184]" /><div><p className="font-semibold">Identitas terverifikasi</p><p className="mt-1 text-[11px] text-[#8995aa]">Pemeriksaan role melalui API NestJS</p></div></div>
                    <div className="flex items-start gap-3"><SlidersHorizontal size={18} className="shrink-0 text-[#5878c4]" /><div><p className="font-semibold">Navigasi sesuai role</p><p className="mt-1 text-[11px] text-[#8995aa]">Akses data tetap diatur backend</p></div></div>
                    <div className="flex items-start gap-3"><FileClock size={18} className="shrink-0 text-[#e8ad44]" /><div><p className="font-semibold">Aktivitas terbaru</p><p className="mt-1 text-[11px] text-[#8995aa]">Belum terhubung ke Audit Trail</p></div></div>
                  </div>
                </section>
              </div>
            </div>

            <div className="min-w-0 space-y-5">
              <section className="rounded-md border border-[#e1e6ee] bg-white shadow-sm">
                <div className="border-b border-[#ebeff4] px-5 py-4"><h2 className="text-[16px] font-semibold">Distribusi Menu</h2><p className="mt-1 text-[11px] text-[#8b98ac]">Berdasarkan role aktif</p></div>
                <div className="flex items-center gap-5 px-5 py-6">
                  <div className="grid size-[116px] shrink-0 place-items-center rounded-full" style={{ background: `conic-gradient(#1d9c95 ${accessPercentage}%, #e5eaf2 ${accessPercentage}% 100%)` }}>
                    <div className="flex size-[86px] flex-col items-center justify-center rounded-full bg-white"><span className="text-[22px] font-bold">{allowed.length}</span><span className="text-[10px] text-[#8b97ad]">dari {MODULES.length}</span></div>
                  </div>
                  <div className="min-w-0 space-y-2 text-[11px] text-[#596985]"><div className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-[#1d9c95]" /> Tampil di menu</div><div className="flex items-center gap-2"><span className="size-2.5 rounded-full bg-[#e5eaf2]" /> Role lainnya</div><p className="pt-1 leading-5 text-[#8b98ac]">Jumlah menu navigasi, bukan saldo atau transaksi.</p></div>
                </div>
              </section>
              <section className="rounded-md border border-[#e1e6ee] bg-white shadow-sm">
                <div className="border-b border-[#ebeff4] px-5 py-4"><h2 className="text-[16px] font-semibold">Modul per Area</h2><p className="mt-1 text-[11px] text-[#8b98ac]">Jumlah menu sesuai akses</p></div>
                <div className="flex h-[200px] items-end justify-around gap-3 px-5 pb-4 pt-5">
                  {accessibleByArea.map((item) => <div key={item.area} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"><div className="text-[11px] font-semibold text-[#5b6a86]">{item.count}</div><div className="w-full max-w-[46px] rounded-t-md transition-[height]" style={{ height: `${Math.max(4, (item.count / maxAreaCount) * 100)}%`, backgroundColor: AREA_COLORS[item.area] }} /><div className="w-full truncate text-center text-[9px] text-[#7888a2]" title={item.area}>{item.area}</div></div>)}
                </div>
              </section>
              <section className="rounded-md border border-[#e1e6ee] bg-white p-5 shadow-sm">
                <div className="flex items-start gap-3"><ShieldCheck size={20} className="mt-0.5 shrink-0 text-[#16a184]" /><div><h2 className="text-[14px] font-semibold">Status akses</h2><p className="mt-1 text-[12px] text-[#72829c]">{formatRole(role)}</p><p className="mt-3 text-[11px] leading-5 text-[#8c99af]">Autentikasi telah diverifikasi. Izin baca atau ubah tiap transaksi tetap harus diperiksa oleh layanan backend.</p></div></div>
              </section>
            </div>
          </div>

            </>
          ) : (
            <div className="min-w-0 flex-1">{children}</div>
          )}

          <footer className="mt-auto flex flex-wrap justify-between gap-2 border-t border-[#e0e6ee] pb-2 pt-4 text-[11px] text-[#8b96a9]"><span>© 2026 LedgerCore · Enterprise Finance Management</span><span>Next.js · NestJS · PostgreSQL · Supabase</span></footer>
        </main>
      </div>
    </div>
  );
}

