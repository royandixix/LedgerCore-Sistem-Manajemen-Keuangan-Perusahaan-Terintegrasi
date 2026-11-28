"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  Bell,
  BookOpen,
  Building2,
  CalendarDays,
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
  {
    title: "Organisasi",
    description: "Profil dan daftar perusahaan",
    href: "/organizations",
    icon: Building2,
    roles: ["SUPER_ADMIN"],
    area: "Administrasi",
  },
  {
    title: "Pengguna",
    description: "Akun dan keanggotaan",
    href: "/users",
    icon: Users,
    roles: ["SUPER_ADMIN"],
    area: "Administrasi",
  },
  {
    title: "Role & Permissions",
    description: "Pengaturan kewenangan",
    href: "/roles",
    icon: ShieldCheck,
    roles: ["SUPER_ADMIN"],
    area: "Administrasi",
  },
  {
    title: "Pengaturan",
    description: "Konfigurasi platform",
    href: "/settings",
    icon: Settings2,
    roles: ["SUPER_ADMIN", "FINANCE_ADMIN"],
    area: "Administrasi",
  },
  {
    title: "Audit Trail",
    description: "Jejak aktivitas sistem",
    href: "/audit-trail",
    icon: FileClock,
    roles: ["SUPER_ADMIN", "AUDITOR"],
    area: "Pelaporan",
  },
  {
    title: "Chart of Accounts",
    description: "Daftar dan kode akun",
    href: "/accounts",
    icon: Wallet,
    roles: ["SUPER_ADMIN", "FINANCE_ADMIN", "ACCOUNTANT", "AUDITOR"],
    area: "Akuntansi",
  },
  {
    title: "Periode Fiskal",
    description: "Periode pembukuan",
    href: "/fiscal-periods",
    icon: CalendarDays,
    roles: ["SUPER_ADMIN", "FINANCE_ADMIN", "ACCOUNTANT"],
    area: "Akuntansi",
  },
  {
    title: "Jurnal Umum",
    description: "Entri jurnal akuntansi",
    href: "/journals",
    icon: BookOpen,
    roles: ["SUPER_ADMIN", "FINANCE_ADMIN", "ACCOUNTANT"],
    area: "Akuntansi",
  },
  {
    title: "Buku Besar",
    description: "Rincian transaksi akun",
    href: "/ledger",
    icon: Layers3,
    roles: [
      "SUPER_ADMIN",
      "FINANCE_ADMIN",
      "ACCOUNTANT",
      "FINANCE_MANAGER",
      "AUDITOR",
    ],
    area: "Akuntansi",
  },
  {
    title: "Persetujuan",
    description: "Tinjauan transaksi",
    href: "/approvals",
    icon: ClipboardCheck,
    roles: ["SUPER_ADMIN", "FINANCE_ADMIN", "FINANCE_MANAGER"],
    area: "Operasional",
  },
  {
    title: "Pengeluaran",
    description: "Beban dan biaya",
    href: "/expenses",
    icon: Receipt,
    roles: ["SUPER_ADMIN", "FINANCE_ADMIN", "AP_OFFICER"],
    area: "Operasional",
  },
  {
    title: "Invoice",
    description: "Tagihan pelanggan",
    href: "/invoices",
    icon: FileText,
    roles: ["SUPER_ADMIN", "FINANCE_ADMIN", "AR_OFFICER"],
    area: "Operasional",
  },
  {
    title: "Utang Usaha",
    description: "Tagihan pemasok",
    href: "/payables",
    icon: CreditCard,
    roles: ["SUPER_ADMIN", "FINANCE_ADMIN", "FINANCE_MANAGER", "AP_OFFICER"],
    area: "Operasional",
  },
  {
    title: "Piutang Usaha",
    description: "Tagihan yang diterima",
    href: "/receivables",
    icon: Wallet,
    roles: ["SUPER_ADMIN", "FINANCE_ADMIN", "FINANCE_MANAGER", "AR_OFFICER"],
    area: "Operasional",
  },
  {
    title: "Rekonsiliasi",
    description: "Pencocokan pembukuan",
    href: "/reconciliation",
    icon: FileCheck2,
    roles: ["SUPER_ADMIN", "FINANCE_ADMIN", "ACCOUNTANT"],
    area: "Akuntansi",
  },
  {
    title: "Laporan Keuangan",
    description: "Ringkasan dan analitik",
    href: "/reports",
    icon: BarChart3,
    roles: [
      "SUPER_ADMIN",
      "FINANCE_ADMIN",
      "FINANCE_MANAGER",
      "ACCOUNTANT",
      "AUDITOR",
    ],
    area: "Pelaporan",
  },
];

const AREAS: Area[] = ["Administrasi", "Akuntansi", "Operasional", "Pelaporan"];
const PLOTS = {
  minggu: {
    labels: ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"],
    primary:
      "M 34 278 C 120 200 166 124 207 122 S 310 91 371 98 S 492 146 543 195 S 663 220 716 184 S 808 112 877 68",
    secondary:
      "M 34 182 C 116 140 161 100 207 107 S 320 154 371 176 S 486 270 543 267 S 666 202 716 183 S 808 158 877 144",
  },
  bulan: {
    labels: ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul"],
    primary:
      "M 34 260 C 120 206 150 168 207 143 S 315 191 371 123 S 484 113 543 143 S 666 91 716 94 S 815 55 877 48",
    secondary:
      "M 34 197 C 112 148 149 111 207 115 S 318 142 371 180 S 485 240 543 219 S 656 138 716 163 S 822 121 877 113",
  },
};

function formatRole(role: RoleCode) {
  return ROLE_LABEL[role];
}

function CardIcon({
  icon: Icon,
  accent,
}: {
  icon: LucideIcon;
  accent: string;
}) {
  return (
    <div
      className={`grid size-12 shrink-0 place-items-center rounded-full text-white shadow-[0_8px_18px_rgba(30,40,70,.18)] ${accent}`}
    >
      <Icon size={20} strokeWidth={2.2} />
    </div>
  );
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
  const [period, setPeriod] = useState<"minggu" | "bulan">("bulan");
  const [showAll, setShowAll] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [feedback, setFeedback] = useState("");

  const allowed = useMemo(
    () => MODULES.filter((item) => item.roles.includes(role)),
    [role],
  );
  const filtered = useMemo(() => {
    const q = search.trim().toLocaleLowerCase("id-ID");
    return allowed.filter((item) =>
      `${item.title} ${item.description} ${item.area}`
        .toLocaleLowerCase("id-ID")
        .includes(q),
    );
  }, [allowed, search]);
  const selectedModule = MODULES.find((m) => m.href === pathname);
  const pageTitle = isDashboard
    ? "Dashboard"
    : (selectedModule?.title ?? "Workspace");
  const initials = email.split("@")[0]?.slice(0, 2).toUpperCase() || "LC";
  const activeAreas = AREAS.filter((area) =>
    allowed.some((item) => item.area === area),
  ).length;
  const financeModules = allowed.filter(
    (item) => item.area === "Akuntansi",
  ).length;
  const coverage = Math.round((allowed.length / MODULES.length) * 100);
  const visible = showAll ? filtered : filtered.slice(0, 6);
  const plot = PLOTS[period];
  const areaData = AREAS.map((area) => ({
    area,
    count: allowed.filter((item) => item.area === area).length,
  }));
  async function shareDashboard() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setFeedback("Tautan berhasil disalin.");
    } catch {
      setFeedback("Salin tautan secara manual dari bilah alamat.");
    }
  }

  function exportModules() {
    const escapeCell = (value: string) => `"${value.replaceAll('"', '""')}"`;
    const rows = [
      ["Modul", "Area", "Deskripsi", "Route"],
      ...filtered.map((item) => [
        item.title,
        item.area,
        item.description,
        item.href,
      ]),
    ];
    const csv = `\ufeff${rows.map((row) => row.map(escapeCell).join(",")).join("\r\n")}`;
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "ledgercore-workspace-modules.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setFeedback("Daftar modul berhasil diekspor, bukan transaksi keuangan.");
  }

  return (
    <div
      data-ledgercore-notus="true"
      className="min-h-screen bg-[#eef2f7] font-sans text-[#334155]"
    >
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Tutup menu navigasi"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-[#101c34]/60 lg:hidden"
        />
      )}
      <aside
        aria-label="Navigasi LedgerCore"
        className={`fixed inset-y-0 left-0 z-50 flex w-[236px] flex-col border-r border-[#e1e7ef] bg-white text-[#30415b] shadow-[3px_0_18px_rgba(20,30,50,.045)] transition-transform duration-200 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-[89px] shrink-0 items-center justify-between border-b border-[#eef1f6] px-6">
          <Link
            href="/dashboard"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-2.5 text-[16px] font-black uppercase tracking-[.02em] text-[#253750]"
          >
            <span className="grid size-8 place-items-center rounded-lg bg-[#e9f7fe] text-[#0a90d0]">
              <Layers3 size={21} />
            </span>
            LEDGERCORE
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Tutup sidebar"
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden"
          >
            <X size={18} />
          </button>
        </div>
        <nav
          aria-label="Menu utama"
          className="min-h-0 flex-1 space-y-1 overflow-y-auto px-4 py-5"
        >
          <Link
            href="/dashboard"
            onClick={() => setSidebarOpen(false)}
            aria-current={isDashboard ? "page" : undefined}
            className={`flex min-h-10 items-center gap-3 rounded-lg px-3 text-[12px] font-bold transition ${isDashboard ? "bg-[#e9f7ff] text-[#008bd0]" : "text-[#40536b] hover:bg-[#f1f7fc] hover:text-[#078bc8]"}`}
          >
            <LayoutDashboard size={17} />
            <span>Dashboard</span>
          </Link>
          {AREAS.map((area) => {
            const items = allowed.filter((item) => item.area === area);
            if (!items.length) return null;
            return (
              <div key={area} className="pt-4">
                <p className="px-3 pb-2 text-[10px] font-extrabold uppercase tracking-[.12em] text-[#8e9cb1]">
                  {area}
                </p>
                <div className="space-y-0.5">
                  {items.map((item) => {
                    const Icon = item.icon;
                    const active = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className={`flex min-h-10 items-center gap-3 rounded-lg px-3 py-2 text-[12px] font-bold transition ${active ? "bg-[#e9f7ff] text-[#008bc9]" : "text-[#40536b] hover:bg-[#f1f7fc] hover:text-[#078bc8]"}`}
                      >
                        <Icon size={16} className="shrink-0" />
                        <span className="min-w-0 truncate">{item.title}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>
        <div className="shrink-0 border-t border-[#e9edf3] px-5 py-4">
          <div className="mb-3 flex items-center gap-2 text-[11px] font-bold text-[#687891]">
            <LockKeyhole size={15} className="text-[#0497cb]" />
            {formatRole(role)}
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#dfe6ee] px-3 py-2.5 text-[12px] font-bold text-[#35465e] hover:border-[#b7ddec] hover:bg-[#f1faff]"
            >
              <LogOut size={15} />
              Keluar
            </button>
          </form>
        </div>
      </aside>

      <div className="min-h-screen min-w-0 lg:pl-[236px]">
        <section
          className={`relative bg-[#0784bf] text-white ${isDashboard ? "min-h-[328px]" : "min-h-[244px]"}`}
        >
          <div
            className="absolute inset-0 pointer-events-none opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle at 80% 20%, white 0, transparent 34%)",
            }}
          />
          <header className="relative z-20 mx-auto flex h-[88px] max-w-[1660px] items-center gap-3 px-4 sm:px-7 xl:px-10">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Buka menu"
              className="grid size-10 place-items-center rounded-lg border border-white/30 hover:bg-white/10 lg:hidden"
            >
              <Menu size={20} />
            </button>
            <div className="min-w-0 flex-1 truncate text-[13px] font-bold uppercase tracking-[.04em] sm:text-[14px]">
              {pageTitle}
            </div>
            <div className="relative hidden w-full max-w-[230px] sm:block">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#aabbd3]"
              />
              <input
                aria-label="Cari modul"
                type="search"
                placeholder="Search here..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-10 w-full rounded-md border border-white/20 bg-white pl-9 pr-3 text-[12px] text-[#30405a] outline-none placeholder:text-[#b7c4d7] focus:ring-2 focus:ring-white/50"
              />
              {search.trim() && (
                <div className="absolute right-0 top-[calc(100%+8px)] z-50 max-h-64 w-full overflow-y-auto rounded-lg border border-[#e3e9f2] bg-white p-2 text-[#344258] shadow-xl">
                  <p className="px-2 py-1 text-[10px] text-slate-500">
                    {filtered.length} modul ditemukan
                  </p>
                  {filtered.slice(0, 7).map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSearch("")}
                      className="block rounded-md px-2 py-2 text-[12px] font-semibold hover:bg-[#f0f7fd]"
                    >
                      {item.title}
                    </Link>
                  ))}
                  {!filtered.length && (
                    <p className="px-2 py-3 text-[12px]">
                      Tidak ada modul cocok.
                    </p>
                  )}
                </div>
              )}
            </div>
            <div className="relative">
              <button
                type="button"
                aria-label="Lihat notifikasi"
                aria-expanded={notificationOpen}
                onClick={() => setNotificationOpen((open) => !open)}
                className="grid size-10 place-items-center rounded-full text-white/95 hover:bg-white/15"
              >
                <Bell size={20} />
              </button>
              {notificationOpen && (
                <div className="absolute right-0 top-12 z-50 w-[min(270px,85vw)] rounded-xl bg-white p-4 text-[#35435b] shadow-xl">
                  <p className="text-sm font-bold">Notifikasi</p>
                  <p className="mt-2 text-[12px] text-slate-500">
                    Belum ada notifikasi yang tersedia dari API.
                  </p>
                  <button
                    type="button"
                    onClick={() => setNotificationOpen(false)}
                    className="mt-3 text-[11px] font-bold text-[#0686c0]"
                  >
                    Tutup
                  </button>
                </div>
              )}
            </div>
            <span className="grid size-10 shrink-0 place-items-center rounded-full border-2 border-white/60 bg-[#e7eef5] text-[12px] font-extrabold text-[#314568]">
              {initials}
            </span>
            <div className="hidden max-w-[170px] sm:block">
              <p className="truncate text-[11px] font-bold">{email}</p>
              <p className="mt-0.5 truncate text-[10px] text-white/75">
                {formatRole(role)}
              </p>
            </div>
          </header>
          <div className="relative z-10 mx-auto max-w-[1660px] px-4 pt-1 sm:px-7 xl:px-10">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/70">
              LEDGERCORE / WORKSPACE
            </p>
            <h1 className="mt-2 text-[24px] font-black tracking-tight sm:text-[28px]">
              {isDashboard ? "Enterprise Finance Dashboard" : pageTitle}
            </h1>
            <p className="mt-2 max-w-2xl text-[12px] text-white/80">
              {isDashboard
                ? "Ringkasan navigasi dan akses platform. Informasi finansial akan terhubung setelah modul transaksi tersedia."
                : (selectedModule?.description ??
                  "Workspace manajemen perusahaan.")}
            </p>
          </div>
        </section>

        <main
          className={`relative z-10 mx-auto flex w-full max-w-[1660px] flex-col gap-7 px-4 pb-10 sm:px-7 xl:px-10 ${isDashboard ? "-mt-[126px]" : "-mt-[76px]"}`}
        >
          {isDashboard ? (
            <>
              <section
                aria-label="Ringkasan akses platform"
                className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
              >
                {[
                  {
                    label: "MODUL TERSEDIA",
                    value: String(allowed.length),
                    caption: `Dari ${MODULES.length} modul platform`,
                    icon: LayoutDashboard,
                    color: "bg-[#f64245]",
                    symbol: "↗",
                  },
                  {
                    label: "AREA WORKSPACE",
                    value: String(activeAreas),
                    caption: "Area sesuai akses akun",
                    icon: Layers3,
                    color: "bg-[#ff7718]",
                    symbol: "↗",
                  },
                  {
                    label: "MODUL AKUNTANSI",
                    value: String(financeModules),
                    caption: "Modul akuntansi tersedia",
                    icon: BookOpen,
                    color: "bg-[#ed3d95]",
                    symbol: "•",
                  },
                  {
                    label: "CAKUPAN AKSES",
                    value: `${coverage}%`,
                    caption: "Berdasarkan role aktif",
                    icon: ShieldCheck,
                    color: "bg-[#0aa7e8]",
                    symbol: "↗",
                  },
                ].map((item) => (
                  <article
                    key={item.label}
                    className="flex min-h-[132px] flex-col justify-between rounded-[5px] border border-[#e1e7ed] bg-white px-5 py-5 shadow-[0_8px_16px_rgba(30,45,65,.09)]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[10px] font-extrabold tracking-[.045em] text-[#99a8bf]">
                          {item.label}
                        </p>
                        <p className="mt-1 text-[23px] font-bold leading-7 text-[#33445e]">
                          {item.value}
                        </p>
                      </div>
                      <CardIcon icon={item.icon} accent={item.color} />
                    </div>
                    <p className="mt-3 text-[11px] text-[#8da0b9]">
                      <span className="mr-1 font-black text-[#10b981]">
                        {item.symbol}
                      </span>
                      {item.caption}
                    </p>
                  </article>
                ))}
              </section>

              {feedback && (
                <div
                  role="status"
                  className="flex items-center justify-between rounded-md border border-[#bee7f5] bg-white px-4 py-2 text-[12px] text-[#176b92]"
                >
                  <span>{feedback}</span>
                  <button
                    type="button"
                    onClick={() => setFeedback("")}
                    aria-label="Tutup pemberitahuan"
                  >
                    <X size={17} />
                  </button>
                </div>
              )}

              <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.95fr)_minmax(320px,.95fr)]">
                <section className="overflow-hidden rounded-[5px] bg-[#34445f] shadow-[0_8px_18px_rgba(23,43,66,.13)]">
                  <div className="flex flex-wrap items-start justify-between gap-3 px-5 pt-5 sm:px-6">
                    <div>
                      <p className="text-[10px] font-extrabold uppercase tracking-[.08em] text-[#c4cfdf]">
                        OVERVIEW / DATA DEMO
                      </p>
                      <h2 className="mt-1 text-[18px] font-bold text-white">
                        Sales value
                      </h2>
                      <p className="mt-1 text-[11px] text-[#bac8db]">
                        Ilustrasi grafik, bukan data transaksi aktual
                      </p>
                    </div>
                    <div
                      className="inline-flex rounded-md bg-white/10 p-1"
                      role="group"
                      aria-label="Periode grafik demo"
                    >
                      <button
                        type="button"
                        aria-pressed={period === "minggu"}
                        onClick={() => setPeriod("minggu")}
                        className={`rounded px-3 py-1.5 text-[11px] font-bold ${period === "minggu" ? "bg-white text-[#33435e]" : "text-white/80 hover:bg-white/10"}`}
                      >
                        Minggu
                      </button>
                      <button
                        type="button"
                        aria-pressed={period === "bulan"}
                        onClick={() => setPeriod("bulan")}
                        className={`rounded px-3 py-1.5 text-[11px] font-bold ${period === "bulan" ? "bg-white text-[#33435e]" : "text-white/80 hover:bg-white/10"}`}
                      >
                        Bulan
                      </button>
                    </div>
                  </div>
                  <div className="px-3 pb-3 pt-2 sm:px-5">
                    <svg
                      role="img"
                      aria-label="Ilustrasi grafik garis dua seri, bukan nilai transaksi"
                      viewBox="0 0 915 350"
                      preserveAspectRatio="none"
                      className="h-[245px] w-full sm:h-[315px]"
                    >
                      {[60, 105, 150, 195, 240, 285].map((y) => (
                        <line
                          key={y}
                          x1="34"
                          x2="877"
                          y1={y}
                          y2={y}
                          stroke="#8291a6"
                          strokeDasharray="3 4"
                          strokeOpacity=".4"
                        />
                      ))}
                      {[34, 207, 371, 543, 716, 877].map((x) => (
                        <line
                          key={x}
                          x1={x}
                          x2={x}
                          y1="50"
                          y2="300"
                          stroke="#8291a6"
                          strokeOpacity=".13"
                        />
                      ))}
                      <path
                        d={plot.secondary}
                        stroke="#5766e5"
                        strokeWidth="3.1"
                        fill="none"
                        vectorEffect="non-scaling-stroke"
                        strokeLinecap="round"
                      />
                      <path
                        d={plot.primary}
                        stroke="#ffffff"
                        strokeWidth="3.1"
                        fill="none"
                        vectorEffect="non-scaling-stroke"
                        strokeLinecap="round"
                      />
                      {plot.labels.map((label, i) => (
                        <text
                          key={label}
                          x={34 + i * 140.5}
                          y="329"
                          textAnchor="middle"
                          fill="#d1d8e4"
                          fontSize="13"
                        >
                          {label}
                        </text>
                      ))}
                    </svg>
                    <div className="flex items-center justify-end gap-5 px-3 pb-2 text-[11px] text-[#dbe4f0]">
                      <span className="flex items-center gap-2">
                        <i className="size-3 bg-[#5969e5]" />
                        Demo B
                      </span>
                      <span className="flex items-center gap-2">
                        <i className="size-3 bg-white" />
                        Demo A
                      </span>
                    </div>
                  </div>
                </section>

                <section className="min-w-0 overflow-hidden rounded-[5px] border border-[#e1e7ed] bg-white shadow-[0_8px_18px_rgba(23,43,66,.09)]">
                  <div className="px-5 pt-5">
                    <p className="text-[10px] font-extrabold uppercase tracking-[.08em] text-[#9daabf]">
                      PERFORMANCE
                    </p>
                    <h2 className="mt-1 text-[18px] font-bold text-[#34425d]">
                      Modul per area
                    </h2>
                    <p className="mt-1 text-[11px] text-[#96a3b8]">
                      Jumlah modul yang bisa dibuka oleh role aktif
                    </p>
                  </div>
                  <div className="flex h-[260px] min-w-0 items-stretch justify-between gap-2 px-3 pb-5 pt-5 sm:h-[315px] sm:gap-3 sm:px-5 sm:pb-6 sm:pt-7">
                    {(() => {
                      const chartMax = Math.max(
                        1,
                        ...areaData.map((entry) => entry.count),
                        ...areaData.map((entry) =>
                          MODULES.filter(
                            (module) => module.area === entry.area
                          ).length
                        ),
                      );

                      return areaData.map((item, index) => (
                      <div
                        key={item.area}
                        className="flex h-full min-h-0 min-w-0 flex-1 flex-col gap-2"
                      >
                        <div className="flex min-h-0 flex-1 items-end justify-center gap-1 overflow-hidden border-b border-[#e4e9f2]">
                          <div
                            className="w-[35%] min-w-[8px] max-w-[27px] rounded-t-sm bg-[#f44196]"
                            style={{
                              height: `${item.count === 0 ? 0 : Math.min(90, Math.max(4, (item.count / chartMax) * 90))}%`,
                            }}
                            title={`${item.area}: ${item.count} modul`}
                          />
                          <div
                            className="w-[35%] min-w-[8px] max-w-[27px] rounded-t-sm bg-[#5355d9]"
                            style={{
                              height: `${MODULES.filter((m) => m.area === item.area).length === 0 ? 0 : Math.min(90, Math.max(4, (MODULES.filter((m) => m.area === item.area).length / chartMax) * 90))}%`,
                            }}
                            title={`Total platform: ${MODULES.filter((m) => m.area === item.area).length}`}
                          />
                        </div>
                        <div
                          className="truncate text-center text-[9px] font-semibold text-[#7b8ba3]"
                          title={item.area}
                        >
                          {["Admin", "Akun", "Operasi", "Laporan"][index]}
                        </div>
                      </div>
                    ));
                    })()}
                  </div>
                  <div className="flex items-center justify-center gap-4 border-t border-[#edf0f5] px-3 py-3 text-[10px] font-bold text-[#8694aa]">
                    <span>
                      <i className="mr-1 inline-block size-2.5 bg-[#f44196]" />{" "}
                      Akses role
                    </span>
                    <span>
                      <i className="mr-1 inline-block size-2.5 bg-[#5355d9]" />{" "}
                      Total platform
                    </span>
                  </div>
                </section>
              </div>

              <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.95fr)_minmax(320px,.95fr)]">
                <section className="overflow-hidden rounded-[5px] border border-[#e1e7ed] bg-white shadow-[0_5px_14px_rgba(23,43,66,.07)]">
                  <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                    <div>
                      <p className="text-[17px] font-bold text-[#34425d]">
                        Daftar modul
                      </p>
                      <p className="mt-1 text-[11px] text-[#91a0b5]">
                        Modul yang tersedia sesuai role akun
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAll(!showAll)}
                        className="rounded-md bg-[#6257e9] px-3 py-2 text-[10px] font-extrabold text-white hover:bg-[#5148cf]"
                      >
                        {showAll ? "LEBIH SEDIKIT" : "SEE ALL"}
                      </button>
                      <button
                        type="button"
                        title="Ekspor modul"
                        aria-label="Ekspor daftar modul CSV"
                        onClick={exportModules}
                        className="grid size-9 place-items-center rounded-md border border-[#dfe6f1] text-[#5d6b85] hover:bg-slate-50"
                      >
                        <Download size={17} />
                      </button>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[570px] text-left text-[12px]">
                      <thead className="bg-[#f4f6fa] text-[10px] font-extrabold uppercase tracking-[.05em] text-[#7586a0]">
                        <tr>
                          <th className="px-5 py-3">MODULE</th>
                          <th className="px-4 py-3">AREA</th>
                          <th className="px-4 py-3">DESKRIPSI</th>
                          <th className="px-4 py-3 text-right">AKSI</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#edf0f5]">
                        {visible.map((item) => (
                          <tr key={item.href} className="hover:bg-[#f5faff]">
                            <td className="px-5 py-4 font-bold text-[#3f4e67]">
                              {item.title}
                            </td>
                            <td className="px-4 py-4 text-[#7c8da4]">
                              {item.area}
                            </td>
                            <td className="px-4 py-4 text-[#8594a9]">
                              {item.description}
                            </td>
                            <td className="px-4 py-4 text-right">
                              <Link
                                href={item.href}
                                className="inline-flex items-center gap-1 font-bold text-[#0287c0] hover:underline"
                              >
                                Buka <ArrowRight size={14} />
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {!visible.length && (
                      <div className="p-8 text-center text-[12px] text-slate-500">
                        Tidak ada modul yang sesuai.
                      </div>
                    )}
                  </div>
                </section>
                <section className="overflow-hidden rounded-[5px] border border-[#e1e7ed] bg-white shadow-[0_5px_14px_rgba(23,43,66,.07)]">
                  <div className="flex items-center justify-between gap-3 px-5 py-4">
                    <div>
                      <p className="text-[17px] font-bold text-[#34425d]">
                        Area workspace
                      </p>
                      <p className="mt-1 text-[11px] text-[#91a0b5]">
                        Distribusi modul
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={shareDashboard}
                      className="rounded-md bg-[#6257e9] px-3 py-2 text-[10px] font-extrabold text-white hover:bg-[#5148cf]"
                    >
                      <Copy size={13} className="mr-1 inline" />
                      SALIN LINK
                    </button>
                  </div>
                  <table className="w-full text-left text-[12px]">
                    <thead className="bg-[#f4f6fa] text-[10px] font-extrabold uppercase text-[#7586a0]">
                      <tr>
                        <th className="px-5 py-3">AREA</th>
                        <th className="px-3 py-3">MODUL</th>
                        <th className="px-5 py-3">CAKUPAN</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#edf0f5]">
                      {areaData.map((item) => (
                        <tr key={item.area}>
                          <td className="px-5 py-4 font-bold text-[#41516a]">
                            {item.area}
                          </td>
                          <td className="px-3 py-4 text-[#657791]">
                            {item.count}
                          </td>
                          <td className="px-5 py-4">
                            <div className="h-2 overflow-hidden rounded-full bg-[#edf1f6]">
                              <div
                                className="h-full rounded-full bg-[#f04491]"
                                style={{
                                  width: `${(item.count / Math.max(1, MODULES.filter((m) => m.area === item.area).length)) * 100}%`,
                                }}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="border-t border-[#eef1f5] px-5 py-3 text-[10px] text-[#8f9db0]">
                    Grafik dan tabel akses dihitung dari menu yang tersedia.
                    Bukan nilai transaksi keuangan.
                  </div>
                </section>
              </div>
            </>
          ) : (
            <section
              data-ledgercore-module="true"
              className="min-w-0 overflow-visible rounded-[6px] border border-[#e0e7f0] bg-[#f9fbfd] p-3 shadow-[0_8px_24px_rgba(30,45,70,.07)] sm:p-5"
            >
              {children}
            </section>
          )}
          <footer className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-[#dbe4ee] py-5 text-[11px] text-[#8998ac]">
            <span>© 2026 LedgerCore · Enterprise Finance Management</span>
            <span>Next.js · NestJS · PostgreSQL · Supabase</span>
          </footer>
        </main>
      </div>
    </div>
  );
}
