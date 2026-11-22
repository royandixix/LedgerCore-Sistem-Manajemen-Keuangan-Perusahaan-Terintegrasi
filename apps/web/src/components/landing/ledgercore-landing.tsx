"use client";

import { useEffect, useId, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  ClipboardCheck,
  FileClock,
  FileText,
  Fingerprint,
  GitBranch,
  Landmark,
  Layers3,
  LayoutDashboard,
  LockKeyhole,
  Menu,
  Receipt,
  Scale,
  SearchCheck,
  ShieldCheck,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";

type Tab = "ringkasan" | "jurnal" | "persetujuan";
type Filter = "Semua" | "Akuntansi" | "Transaksi" | "Kontrol";

const demos: Record<
  Tab,
  {
    title: string;
    subtitle: string;
    kpiA: string;
    kpiB: string;
    labelA: string;
    labelB: string;
    first: number[];
    second: number[];
  }
> = {
  ringkasan: {
    title: "Ikhtisar keuangan",
    subtitle: "Satu tampilan untuk memahami kondisi keuangan.",
    kpiA: "Rp 2,48 M",
    kpiB: "Rp 1,36 M",
    labelA: "Pemasukan",
    labelB: "Pengeluaran",
    first: [32, 48, 43, 65, 57, 82],
    second: [23, 30, 28, 42, 39, 49],
  },
  jurnal: {
    title: "Pencatatan jurnal",
    subtitle: "Dari draft hingga jurnal siap diposting.",
    kpiA: "248",
    kpiB: "236",
    labelA: "Jurnal tercatat",
    labelB: "Jurnal terposting",
    first: [27, 42, 53, 49, 69, 81],
    second: [22, 37, 46, 44, 63, 76],
  },
  persetujuan: {
    title: "Alur persetujuan",
    subtitle: "Status setiap permintaan lebih mudah dipantau.",
    kpiA: "186",
    kpiB: "174",
    labelA: "Permintaan masuk",
    labelB: "Telah diproses",
    first: [28, 36, 49, 64, 60, 82],
    second: [23, 32, 43, 55, 54, 76],
  },
};

const modules = [
  {
    name: "Bagan Akun",
    category: "Akuntansi",
    icon: BookOpen,
    detail:
      "Struktur akun keuangan yang terorganisasi untuk mendukung pencatatan konsisten.",
  },
  {
    name: "Jurnal Umum",
    category: "Akuntansi",
    icon: FileText,
    detail:
      "Rancangan pencatatan debit dan kredit dengan validasi keseimbangan jurnal.",
  },
  {
    name: "Buku Besar",
    category: "Akuntansi",
    icon: Landmark,
    detail: "Riwayat pergerakan dan saldo setiap akun dalam periode akuntansi.",
  },
  {
    name: "Periode Akuntansi",
    category: "Akuntansi",
    icon: FileClock,
    detail:
      "Pengelolaan periode untuk membantu pengendalian pencatatan transaksi.",
  },
  {
    name: "Invoice",
    category: "Transaksi",
    icon: Receipt,
    detail:
      "Informasi tagihan, status pembayaran, dan riwayat invoice dalam satu tempat.",
  },
  {
    name: "Piutang Usaha",
    category: "Transaksi",
    icon: TrendingUp,
    detail: "Pemantauan tagihan pelanggan, jatuh tempo, dan saldo piutang.",
  },
  {
    name: "Utang Usaha",
    category: "Transaksi",
    icon: Wallet,
    detail: "Pemantauan kewajiban pembayaran kepada pemasok dan mitra.",
  },
  {
    name: "Pengeluaran",
    category: "Transaksi",
    icon: CircleDollarSign,
    detail:
      "Pencatatan dan pengelompokan biaya kegiatan operasional perusahaan.",
  },
  {
    name: "Persetujuan",
    category: "Kontrol",
    icon: ClipboardCheck,
    detail: "Alur peninjauan dan keputusan sesuai kewenangan pengguna.",
  },
  {
    name: "Rekonsiliasi",
    category: "Kontrol",
    icon: Scale,
    detail: "Konsep pencocokan transaksi dan catatan untuk meninjau selisih.",
  },
  {
    name: "Audit Trail",
    category: "Kontrol",
    icon: SearchCheck,
    detail: "Riwayat perubahan untuk mendukung penelusuran aktivitas penting.",
  },
  {
    name: "Laporan Keuangan",
    category: "Kontrol",
    icon: LayoutDashboard,
    detail:
      "Rancangan ringkasan dan analisis keuangan untuk pengambilan keputusan.",
  },
] as const;

const roles = [
  {
    code: "SUPER_ADMIN",
    name: "Super Admin",
    subtitle: "Administrasi dan konfigurasi sistem",
    access: [
      "Manajemen organisasi",
      "Pengguna dan hak akses",
      "Konfigurasi platform",
    ],
  },
  {
    code: "FINANCE_ADMIN",
    name: "Finance Admin",
    subtitle: "Koordinasi operasional keuangan",
    access: [
      "Administrasi keuangan",
      "Pemantauan transaksi",
      "Pengaturan proses",
    ],
  },
  {
    code: "ACCOUNTANT",
    name: "Accountant",
    subtitle: "Pencatatan dan pelaporan akuntansi",
    access: ["Bagan akun", "Jurnal dan buku besar", "Periode akuntansi"],
  },
  {
    code: "FINANCE_MANAGER",
    name: "Finance Manager",
    subtitle: "Pengawasan serta persetujuan",
    access: ["Ringkasan keuangan", "Persetujuan transaksi", "Analisis laporan"],
  },
  {
    code: "AP_OFFICER",
    name: "AP Officer",
    subtitle: "Pengelolaan kewajiban perusahaan",
    access: ["Utang usaha", "Tagihan pemasok", "Pemantauan jatuh tempo"],
  },
  {
    code: "AR_OFFICER",
    name: "AR Officer",
    subtitle: "Pengelolaan penerimaan perusahaan",
    access: ["Piutang usaha", "Invoice pelanggan", "Pemantauan penagihan"],
  },
  {
    code: "AUDITOR",
    name: "Auditor",
    subtitle: "Pemeriksaan dan keterlacakan",
    access: ["Jejak audit", "Riwayat aktivitas", "Pemeriksaan laporan"],
  },
];

const faqs = [
  {
    q: "Apa itu LedgerCore?",
    a: "LedgerCore adalah proyek sistem informasi manajemen keuangan perusahaan yang dirancang untuk menggabungkan pencatatan akuntansi, transaksi, persetujuan, dan pelaporan dalam satu lingkungan kerja terintegrasi.",
  },
  {
    q: "Apakah semua modul sudah bisa digunakan?",
    a: "Belum. Fondasi Next.js, NestJS, Prisma, serta koneksi PostgreSQL telah dibangun dan diuji. Modul bisnis, autentikasi, dan hak akses masih dikembangkan bertahap.",
  },
  {
    q: "Apakah dashboard untuk setiap role sama?",
    a: "Tidak. Rancangannya menggunakan navigasi dan informasi yang relevan dengan tanggung jawab tiap role. Dashboard operasional dibuat khusus, terpisah dari desain landing page ini.",
  },
  {
    q: "Apakah angka keuangan di preview merupakan data asli?",
    a: "Bukan. Semua angka, grafik, dan status pada pratinjau Home merupakan data simulasi untuk memperlihatkan konsep antarmuka.",
  },
  {
    q: "Teknologi apa yang digunakan?",
    a: "Frontend menggunakan Next.js dan TypeScript; backend menggunakan NestJS; akses data menggunakan Prisma dan PostgreSQL di Supabase. Supabase Auth direncanakan untuk autentikasi.",
  },
];

function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link
      href="/"
      className={`lc-brand ${light ? "lc-brand-light" : ""}`}
      aria-label="LedgerCore — Beranda"
    >
      <span className="lc-brand-symbol">
        <Layers3 size={20} strokeWidth={2.3} />
      </span>
      <span>
        ledgercore<span className="lc-brand-dot">.</span>
      </span>
    </Link>
  );
}

function DashboardDemo({
  variant = "large",
}: {
  variant?: "large" | "compact";
}) {
  const gradientId = useId();
  const [tab, setTab] = useState<Tab>("ringkasan");
  const [period, setPeriod] = useState<"6 bulan" | "12 bulan">("6 bulan");
  const data = demos[tab];
  const chartA = useMemo(
    () =>
      period === "6 bulan"
        ? data.first
        : [...data.first.map((x) => Math.max(15, x - 17)), ...data.first],
    [data, period],
  );
  const chartB = useMemo(
    () =>
      period === "6 bulan"
        ? data.second
        : [...data.second.map((x) => Math.max(10, x - 10)), ...data.second],
    [data, period],
  );
  const path = (items: number[]) =>
    items
      .map(
        (n, i) =>
          `${i === 0 ? "M" : "L"} ${20 + i * (560 / (items.length - 1))} ${165 - n * 1.55}`,
      )
      .join(" ");

  return (
    <div
      className={`lc-demo ${variant === "compact" ? "lc-demo-compact" : ""}`}
    >
      <div className="lc-demo-chrome">
        <span className="lc-window-dots">
          <i />
          <i />
          <i />
        </span>
        <span>LEDGERCORE / WORKSPACE</span>
        <span className="lc-demo-live">SIMULASI</span>
      </div>
      <div className="lc-demo-body">
        <div className="lc-demo-rail">
          <Layers3 size={18} />
          <LayoutDashboard size={17} />
          <BookOpen size={17} />
          <Receipt size={17} />
          <FileText size={17} />
          <ShieldCheck size={17} />
        </div>
        <div className="lc-demo-main">
          <div className="lc-demo-titlebar">
            <div>
              <span className="lc-kicker">FINANCIAL WORKSPACE</span>
              <h3>{data.title}</h3>
              <p>{data.subtitle}</p>
            </div>
            <span className="lc-demo-avatar">LC</span>
          </div>
          <div
            className="lc-demo-tabs"
            role="tablist"
            aria-label="Contoh modul keuangan"
          >
            {(["ringkasan", "jurnal", "persetujuan"] as Tab[]).map((item) => (
              <button
                type="button"
                role="tab"
                aria-selected={tab === item}
                key={item}
                className={tab === item ? "is-active" : ""}
                onClick={() => setTab(item)}
              >
                {item === "ringkasan"
                  ? "Ringkasan"
                  : item === "jurnal"
                    ? "Jurnal"
                    : "Persetujuan"}
              </button>
            ))}
          </div>
          <div className="lc-demo-cards" key={tab}>
            <div className="lc-demo-kpi">
              <span>{data.labelA}</span>
              <strong>{data.kpiA}</strong>
              <small>
                <TrendingUp size={12} /> Data ilustrasi
              </small>
            </div>
            <div className="lc-demo-kpi">
              <span>{data.labelB}</span>
              <strong>{data.kpiB}</strong>
              <small>
                <CheckCircle2 size={12} /> Data ilustrasi
              </small>
            </div>
          </div>
          <div className="lc-demo-chart">
            <div className="lc-chart-heading">
              <div>
                <b>Perkembangan aktivitas</b>
                <p>Tren berdasarkan data simulasi</p>
              </div>
              <button
                type="button"
                onClick={() =>
                  setPeriod((s) => (s === "6 bulan" ? "12 bulan" : "6 bulan"))
                }
              >
                {period}
                <ChevronDown size={12} />
              </button>
            </div>
            <svg
              className="lc-chart-svg"
              viewBox="0 0 600 195"
              role="img"
              aria-label="Grafik ilustrasi aktivitas keuangan"
              preserveAspectRatio="none"
            >
              {[32, 78, 124, 169].map((y) => (
                <line
                  key={y}
                  x1="0"
                  y1={y}
                  x2="600"
                  y2={y}
                  stroke="#e5ede6"
                  strokeDasharray="4 7"
                />
              ))}
              <path
                d={`${path(chartA)} L 580 182 L 20 182 Z`}
                fill={`url(#${gradientId})`}
              />
              <defs>
                <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#71a57c" stopOpacity=".28" />
                  <stop offset="100%" stopColor="#71a57c" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d={path(chartA)}
                fill="none"
                stroke="#376b4b"
                strokeWidth="3.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d={path(chartB)}
                fill="none"
                stroke="#d5a978"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="7 6"
              />
            </svg>
            <div className="lc-chart-bottom">
              <span>
                <i className="lc-dot-green" />
                {data.labelA}
              </span>
              <span>
                <i className="lc-dot-gold" />
                {data.labelB}
              </span>
              <span className="lc-chart-data">Tidak menggunakan data asli</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LedgercoreLanding() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [filter, setFilter] = useState<Filter>("Semua");
  const [roleIndex, setRoleIndex] = useState(0);
  const activeRole = roles[roleIndex];
  const filteredModules = modules.filter(
    (item) => filter === "Semua" || item.category === filter,
  );

  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>(".lc .lc-reveal"),
    );
    if (
      !("IntersectionObserver" in window) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      sections.forEach((el) => el.classList.add("lc-shown"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(({ target, isIntersecting }) => {
          if (isIntersecting) {
            target.classList.add("lc-shown");
            observer.unobserve(target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -35px 0px" },
    );
    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [filter]);

  return (
    <div className="lc">
      <style>{css}</style>
      <header className="lc-header">
        <div className="lc-container lc-header-inner">
          <Brand />
          <nav className="lc-nav" aria-label="Navigasi utama">
            <a href="#fitur">Fitur</a>
            <a href="#modul">Modul</a>
            <a href="#alur">Cara kerja</a>
            <a href="#roles">Hak akses</a>
            <a href="#faq">FAQ</a>
          </nav>
          <div className="lc-header-actions">
            <Link className="lc-signin" href="/login">
              Masuk
            </Link>
            <Link
              className="lc-button lc-button-dark lc-header-cta"
              href="/login"
            >
              Akses sistem <ArrowUpRight size={16} />
            </Link>
            <button
              className="lc-mobile-toggle"
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Tutup navigasi" : "Buka navigasi"}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav className="lc-mobile-menu" aria-label="Navigasi seluler">
            {[
              ["Fitur", "#fitur"],
              ["Modul", "#modul"],
              ["Cara kerja", "#alur"],
              ["Hak akses", "#roles"],
              ["FAQ", "#faq"],
            ].map(([name, url]) => (
              <a href={url} key={url} onClick={() => setMenuOpen(false)}>
                {name}
                <ArrowUpRight size={16} />
              </a>
            ))}
            <Link href="/login" onClick={() => setMenuOpen(false)}>
              Masuk ke sistem <ArrowRight size={16} />
            </Link>
          </nav>
        )}
      </header>

      <main>
        <section className="lc-hero" id="home">
          <div className="lc-container lc-hero-grid">
            <div className="lc-hero-copy">
              <span className="lc-eyebrow">
                <span className="lc-glow-dot" /> ENTERPRISE FINANCIAL MANAGEMENT
              </span>
              <h1>
                Keuangan yang jelas.
                <br />
                <em>Keputusan</em> yang lebih tepat.
              </h1>
              <p>
                Satu ruang kerja untuk menghubungkan akuntansi, transaksi,
                persetujuan, dan pelaporan—dibangun agar informasi perusahaan
                lebih mudah dipahami dan ditelusuri.
              </p>
              <div className="lc-hero-actions">
                <a href="#workspace" className="lc-button lc-button-dark">
                  Jelajahi platform <ArrowUpRight size={17} />
                </a>
                <a href="#modul" className="lc-text-link">
                  Lihat seluruh modul <ArrowRight size={17} />
                </a>
              </div>
              <div className="lc-hero-caption">
                <CheckCircle2 size={16} /> Fondasi sistem aktif · Modul
                dikembangkan bertahap
              </div>
            </div>
            <div className="lc-hero-visual">
              <div className="lc-float-orb lc-orb-one" />
              <div className="lc-float-orb lc-orb-two" />
              <div className="lc-hero-preview">
                <DashboardDemo variant="compact" />
              </div>
              <div className="lc-float-label">
                <span className="lc-float-icon">
                  <ShieldCheck size={17} />
                </span>
                <span>
                  Terstruktur & terkontrol
                  <small>Rancangan sistem keuangan</small>
                </span>
              </div>
            </div>
          </div>
          <div className="lc-container lc-hero-bottom">
            <span>BUILD WITH CLARITY</span>
            <a href="#fitur">
              Scroll untuk eksplorasi <ArrowDown size={16} />
            </a>
            <span>NEXT.JS / NESTJS / POSTGRESQL</span>
          </div>
        </section>

        <section className="lc-strip">
          <div className="lc-container lc-strip-grid">
            {[
              ["01", "Satu sumber informasi"],
              ["02", "Alur kerja terhubung"],
              ["03", "Kontrol berbasis peran"],
              ["04", "Riwayat dapat ditelusuri"],
            ].map(([n, title]) => (
              <div key={n}>
                <span>{n}</span>
                <strong>{title}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="lc-section" id="fitur">
          <div className="lc-container">
            <div className="lc-section-head lc-reveal">
              <span className="lc-tag">KENAPA LEDGERCORE</span>
              <h2>
                Ketika data keuangan tersebar,{" "}
                <span>keputusan jadi lebih lambat.</span>
              </h2>
              <p>
                LedgerCore dirancang untuk menyatukan proses yang sebelumnya
                berjalan terpisah menjadi alur yang lebih terarah, tanpa
                menghilangkan kontrol dan tanggung jawab setiap divisi.
              </p>
            </div>
            <div className="lc-issues">
              {[
                {
                  icon: GitBranch,
                  title: "Alur lebih terhubung",
                  text: "Catatan transaksi, proses persetujuan, dan laporan dirancang saling berkaitan.",
                },
                {
                  icon: SearchCheck,
                  title: "Informasi mudah ditelusuri",
                  text: "Setiap perubahan penting direncanakan memiliki konteks dan riwayat yang jelas.",
                },
                {
                  icon: ShieldCheck,
                  title: "Tanggung jawab terdefinisi",
                  text: "Akses dan menu disesuaikan dengan fungsi setiap pengguna perusahaan.",
                },
              ].map((item, i) => (
                <article className="lc-issue lc-reveal" key={item.title}>
                  <span className="lc-issue-number">0{i + 1}</span>
                  <div className="lc-issue-icon">
                    <item.icon size={27} strokeWidth={1.6} />
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                  <span className="lc-issue-bottom">
                    PRINSIP PERANCANGAN <ArrowUpRight size={15} />
                  </span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="lc-section lc-workspace-section" id="workspace">
          <div className="lc-container">
            <div className="lc-workspace-heading lc-reveal">
              <div>
                <span className="lc-tag">PRATINJAU PRODUK</span>
                <h2>
                  Lebih dari sekadar angka.
                  <br />
                  <span>Konteks dalam satu layar.</span>
                </h2>
              </div>
              <p>
                Eksplorasi tiga contoh ruang kerja di bawah ini. Klik tab untuk
                melihat simulasi ringkasan, jurnal, dan persetujuan.
              </p>
            </div>
            <div className="lc-workspace-stage lc-reveal">
              <DashboardDemo />
              <div className="lc-workspace-note">
                <CheckCircle2 size={15} /> Contoh tampilan dengan data simulasi.
                Bukan modul transaksi aktif.
              </div>
            </div>
          </div>
        </section>

        <section className="lc-section" id="modul">
          <div className="lc-container">
            <div className="lc-section-head lc-reveal">
              <span className="lc-tag">EKOSISTEM MODUL</span>
              <h2>
                Dirancang menyeluruh.
                <br />
                <span>Dibangun secara modular.</span>
              </h2>
              <p>
                Dari pencatatan dasar hingga pengawasan dan analitik, setiap
                area sistem memiliki tujuan yang jelas. Modul berikut adalah
                cakupan pengembangan LedgerCore.
              </p>
            </div>
            <div className="lc-filter-bar" aria-label="Filter modul">
              {(["Semua", "Akuntansi", "Transaksi", "Kontrol"] as Filter[]).map(
                (item) => (
                  <button
                    key={item}
                    type="button"
                    className={filter === item ? "lc-filter-active" : ""}
                    onClick={() => setFilter(item)}
                    aria-pressed={filter === item}
                  >
                    {item}
                  </button>
                ),
              )}
            </div>
            <div className="lc-module-grid" key={filter}>
              {filteredModules.map((item, i) => (
                <article className="lc-module" key={item.name}>
                  <div className="lc-module-top">
                    <span className="lc-module-icon">
                      <item.icon size={22} strokeWidth={1.65} />
                    </span>
                    <span className="lc-module-index">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3>{item.name}</h3>
                  <p>{item.detail}</p>
                  <span className="lc-module-category">{item.category}</span>
                </article>
              ))}
            </div>
            <p className="lc-fineprint">
              Catatan: daftar ini menunjukkan rancangan fitur. Implementasi dan
              ketersediaan setiap modul dikembangkan bertahap.
            </p>
          </div>
        </section>

        <section className="lc-section lc-process" id="alur">
          <div className="lc-container">
            <div className="lc-process-head lc-reveal">
              <span className="lc-tag lc-tag-light">
                ALUR KERJA TERINTEGRASI
              </span>
              <h2>
                Setiap langkah punya tujuan.
                <br />
                <span>Setiap keputusan punya jejak.</span>
              </h2>
              <p>
                Contoh alur keuangan yang dirancang dalam LedgerCore, mulai dari
                informasi awal sampai menjadi bagian dari laporan perusahaan.
              </p>
            </div>
            <div className="lc-steps">
              {[
                [
                  "01",
                  "Input",
                  "Transaksi dicatat beserta informasi pendukung.",
                ],
                [
                  "02",
                  "Validasi",
                  "Data diperiksa terhadap aturan dan kelengkapan.",
                ],
                [
                  "03",
                  "Persetujuan",
                  "Permintaan ditinjau berdasarkan hak akses.",
                ],
                [
                  "04",
                  "Pencatatan",
                  "Hasil yang memenuhi ketentuan diteruskan ke pembukuan.",
                ],
                [
                  "05",
                  "Pelaporan",
                  "Informasi tersaji untuk pemantauan dan analisis.",
                ],
              ].map(([no, title, desc]) => (
                <article key={no} className="lc-step lc-reveal">
                  <span>{no}</span>
                  <div className="lc-step-marker">
                    <Check size={18} />
                  </div>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="lc-section lc-roles-section" id="roles">
          <div className="lc-container lc-roles-layout">
            <div className="lc-roles-intro lc-reveal">
              <span className="lc-tag">HAK AKSES PENGGUNA</span>
              <h2>
                Berbeda tanggung jawab.
                <br />
                <span>Tetap satu sistem.</span>
              </h2>
              <p>
                LedgerCore dirancang untuk tujuh jenis pengguna. Pilih role
                untuk melihat fokus pekerjaan dan menu utama yang direncanakan.
              </p>
              <div
                className="lc-role-picker"
                role="tablist"
                aria-label="Pilih peran pengguna"
              >
                {roles.map((item, i) => (
                  <button
                    key={item.code}
                    type="button"
                    role="tab"
                    aria-selected={roleIndex === i}
                    onClick={() => setRoleIndex(i)}
                    className={roleIndex === i ? "lc-role-active" : ""}
                  >
                    {item.name}
                    <ArrowRight size={15} />
                  </button>
                ))}
              </div>
            </div>
            <div className="lc-role-card lc-reveal" key={activeRole.code}>
              <div className="lc-role-card-header">
                <span className="lc-role-card-mark">
                  <Fingerprint size={26} />
                </span>
                <span>
                  ROLE PREVIEW / {String(roleIndex + 1).padStart(2, "0")}
                </span>
              </div>
              <span className="lc-role-code">{activeRole.code}</span>
              <h3>{activeRole.name}</h3>
              <p>{activeRole.subtitle}</p>
              <div className="lc-role-sublabel">
                FOKUS AKSES YANG DIRENCANAKAN
              </div>
              <div className="lc-role-access">
                {activeRole.access.map((item) => (
                  <div key={item}>
                    <CheckCircle2 size={17} />
                    {item}
                  </div>
                ))}
              </div>
              <div className="lc-role-bottom">
                <LockKeyhole size={17} /> Dashboard dan perizinan akan
                disesuaikan per role.
              </div>
            </div>
          </div>
        </section>

        <section className="lc-section lc-control-section">
          <div className="lc-container">
            <div className="lc-control-layout">
              <div className="lc-reveal">
                <span className="lc-tag">KONTROL & KETERLACAKAN</span>
                <h2>Dirancang dengan kontrol sejak awal.</h2>
                <p>
                  Sistem keuangan membutuhkan kejelasan otorisasi, konsistensi
                  pencatatan, dan riwayat aktivitas yang dapat diperiksa. Pilar
                  berikut menjadi arah pengembangan LedgerCore.
                </p>
              </div>
              <div className="lc-control-list">
                {[
                  {
                    icon: LockKeyhole,
                    title: "Pembatasan akses",
                    text: "Hak akses berbasis role untuk memisahkan fungsi pengguna.",
                  },
                  {
                    icon: Scale,
                    title: "Integritas pencatatan",
                    text: "Rencana pemeriksaan keseimbangan debit dan kredit pada jurnal.",
                  },
                  {
                    icon: FileClock,
                    title: "Jejak aktivitas",
                    text: "Rancangan pencatatan perubahan untuk kebutuhan penelusuran dan audit.",
                  },
                  {
                    icon: ShieldCheck,
                    title: "Validasi proses",
                    text: "Pemeriksaan data dan tahapan persetujuan sebelum langkah berikutnya.",
                  },
                ].map((item) => (
                  <article
                    className="lc-control-item lc-reveal"
                    key={item.title}
                  >
                    <span>
                      <item.icon size={23} />
                    </span>
                    <div>
                      <h3>{item.title}</h3>
                      <p>{item.text}</p>
                    </div>
                    <ArrowUpRight className="lc-control-arrow" size={18} />
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="lc-section lc-stack">
          <div className="lc-container lc-stack-layout">
            <div className="lc-reveal">
              <span className="lc-tag">ARSITEKTUR TEKNOLOGI</span>
              <h2>
                Fondasi modern.
                <br />
                <span>Siap untuk berkembang.</span>
              </h2>
              <p>
                Frontend, API, dan lapisan data dipisahkan agar pengembangan
                tiap modul lebih terstruktur. Koneksi dasar aplikasi dan
                database telah diuji pada lingkungan pengembangan.
              </p>
              <div className="lc-tech-pills">
                {[
                  "Next.js",
                  "TypeScript",
                  "NestJS",
                  "Prisma",
                  "PostgreSQL",
                  "Supabase",
                ].map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </div>
            <div className="lc-stack-diagram lc-reveal">
              <div>
                <span>01 / PENGALAMAN PENGGUNA</span>
                <strong>Next.js + TypeScript</strong>
                <small>Antarmuka interaktif dan responsif</small>
              </div>
              <ArrowDown size={20} />
              <div>
                <span>02 / LOGIKA BISNIS</span>
                <strong>NestJS REST API</strong>
                <small>Modul, aturan bisnis, dan validasi</small>
              </div>
              <ArrowDown size={20} />
              <div>
                <span>03 / PENYIMPANAN DATA</span>
                <strong>Prisma + PostgreSQL</strong>
                <small>Pengelolaan data melalui Supabase</small>
              </div>
            </div>
          </div>
        </section>

        <section className="lc-section lc-roadmap">
          <div className="lc-container">
            <div className="lc-section-head lc-reveal">
              <span className="lc-tag">STATUS PENGEMBANGAN</span>
              <h2>
                Produk yang berkembang <span>secara bertahap.</span>
              </h2>
              <p>
                Home ini memperlihatkan visi produk. Di bawah ini gambaran tahap
                pengembangan agar cakupan yang sudah tersedia dan yang masih
                direncanakan tetap jelas.
              </p>
            </div>
            <div className="lc-roadmap-grid">
              {[
                [
                  "01",
                  "Fondasi sistem",
                  "Frontend, REST API, Prisma, dan koneksi database",
                  "Fondasi aktif",
                ],
                [
                  "02",
                  "Autentikasi & RBAC",
                  "Login, sesi pengguna, dan tujuh role",
                  "Pengembangan berikutnya",
                ],
                [
                  "03",
                  "Akuntansi & transaksi",
                  "Akun, jurnal, invoice, utang, dan piutang",
                  "Direncanakan",
                ],
                [
                  "04",
                  "Pengawasan & laporan",
                  "Persetujuan, rekonsiliasi, audit, dan analitik",
                  "Direncanakan",
                ],
              ].map(([step, title, text, status], i) => (
                <article className="lc-roadmap-card lc-reveal" key={step}>
                  <div className="lc-roadmap-top">
                    <span>{step}</span>
                    <b className={i === 0 ? "lc-completed" : ""}>{status}</b>
                  </div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                  <span className="lc-roadmap-line">
                    <i style={{ width: i === 0 ? "100%" : "15%" }} />
                  </span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="lc-section lc-faq-section" id="faq">
          <div className="lc-container lc-faq-layout">
            <div className="lc-reveal">
              <span className="lc-tag">PERTANYAAN UMUM</span>
              <h2>
                Kenali LedgerCore <span>lebih dekat.</span>
              </h2>
              <p>
                Informasi mengenai tujuan, teknologi, dan status pengembangan
                sistem.
              </p>
            </div>
            <div className="lc-faq-items">
              {faqs.map((item) => (
                <details className="lc-faq-item" key={item.q}>
                  <summary>
                    {item.q}
                    <ChevronDown size={20} />
                  </summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="lc-final">
          <div className="lc-container lc-final-inner lc-reveal">
            <span className="lc-tag lc-tag-light">LEDGERCORE ENTERPRISE</span>
            <h2>
              Bangun proses yang lebih baik.
              <br />
              <em>Mulai dari fondasi yang benar.</em>
            </h2>
            <p>
              Ruang kerja keuangan yang dirancang untuk menyatukan aktivitas,
              informasi, dan tanggung jawab dalam satu platform.
            </p>
            <div>
              <Link href="/login" className="lc-button lc-button-lime">
                Masuk ke LedgerCore <ArrowUpRight size={18} />
              </Link>
              <a href="#modul" className="lc-final-link">
                Telusuri modul <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="lc-footer">
        <div className="lc-container">
          <div className="lc-footer-main">
            <div>
              <Brand light />
              <p>
                Konsep sistem manajemen keuangan perusahaan yang terintegrasi,
                terstruktur, dan berorientasi pada keterlacakan.
              </p>
            </div>
            <nav aria-label="Navigasi footer">
              <a href="#fitur">Keunggulan</a>
              <a href="#modul">Modul</a>
              <a href="#alur">Alur kerja</a>
              <a href="#roles">Hak akses</a>
              <a href="#faq">FAQ</a>
            </nav>
          </div>
          <div className="lc-footer-bottom">
            <span>
              © {new Date().getFullYear()} LedgerCore. Proyek dalam
              pengembangan.
            </span>
            <span>Dibangun dengan Next.js, NestJS, Prisma & PostgreSQL.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

const css = String.raw`
.lc{--green:#173126;--green2:#2d6249;--lime:#d9f4b3;--ink:#202d25;--muted:#67736b;--line:#dce4da;--paper:#f8faf6;isolation:isolate;min-height:100vh;background:var(--paper);color:var(--ink);font-family:Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;font-size:15px;line-height:1.6;-webkit-font-smoothing:antialiased}
.lc *,.lc *::before,.lc *::after{box-sizing:border-box}.lc a{text-decoration:none;color:inherit}.lc button{font:inherit;cursor:pointer}.lc svg{flex-shrink:0}.lc :where(section[id]){scroll-margin-top:95px}.lc button:focus-visible,.lc a:focus-visible,.lc summary:focus-visible{outline:3px solid #6db984;outline-offset:4px}.lc-container{width:min(1180px,calc(100% - 48px));margin-inline:auto}.lc-header{position:sticky;top:0;z-index:30;background:rgba(248,250,246,.95);border-bottom:1px solid #e4e9e1;backdrop-filter:blur(18px)}.lc-header-inner{min-height:77px;display:flex;align-items:center;gap:34px}.lc-brand{display:inline-flex;align-items:center;gap:10px;font-size:23px;font-weight:800;letter-spacing:-.065em;white-space:nowrap;color:#173126!important}.lc-brand-symbol{display:grid;place-items:center;width:40px;height:40px;color:#d9f4b3;background:#173126;border-radius:12px}.lc-brand-dot{color:#70a567}.lc-brand-light{color:#f4f7f2!important}.lc-nav{display:flex;align-items:center;gap:27px;margin-left:auto}.lc-nav a,.lc-signin{font-size:13px;font-weight:650;color:#58685e;transition:color .2s}.lc-nav a:hover,.lc-signin:hover{color:#195634}.lc-header-actions{display:flex;align-items:center;gap:20px}.lc-button{display:inline-flex;align-items:center;justify-content:center;gap:17px;min-height:49px;padding:0 22px;border-radius:12px;font-weight:700;font-size:13px;transition:transform .25s,background .25s,box-shadow .25s;white-space:nowrap}.lc-button:hover{transform:translateY(-3px)}.lc-button-dark{background:#173126;color:#fff!important;box-shadow:0 9px 24px #1731261a}.lc-button-dark:hover{background:#2b4e3c;box-shadow:0 13px 26px #17312633}.lc-header-cta{min-height:42px;padding:0 17px}.lc-mobile-toggle{display:none;border:0;background:transparent;color:#173126}.lc-mobile-menu{display:none}
.lc-hero{overflow:hidden;background:radial-gradient(ellipse at 83% 37%,#eaf3e2 0%,#f8faf6 51%,#f8faf6 100%)}.lc-hero-grid{display:grid;grid-template-columns:minmax(0,.89fr) minmax(0,1.11fr);align-items:center;gap:60px;padding:86px 0 74px;min-height:690px}.lc-eyebrow,.lc-tag{display:inline-flex;align-items:center;gap:10px;color:#497a58;letter-spacing:.17em;font-size:11px;font-weight:800}.lc-glow-dot{width:8px;height:8px;background:#7fbc75;border-radius:50%;box-shadow:0 0 0 5px #7fbc752b}.lc-hero-copy h1{max-width:650px;font-size:clamp(50px,5.1vw,78px);line-height:1.07;letter-spacing:-.075em;font-weight:800;margin:24px 0 23px}.lc-hero-copy h1 em{font-style:normal;color:#5b9272}.lc-hero-copy>p{max-width:500px;font-size:16px;line-height:1.9;color:#647369;margin:0}.lc-hero-actions{display:flex;align-items:center;gap:25px;margin-top:33px;flex-wrap:wrap}.lc-text-link{display:inline-flex;gap:10px;align-items:center;color:#2d4935!important;font-weight:750;font-size:13px}.lc-text-link:hover svg,.lc-final-link:hover svg{transform:translateX(5px)}.lc-text-link svg,.lc-final-link svg{transition:transform .2s}.lc-hero-caption{display:flex;align-items:center;gap:9px;color:#8a978c;font-size:12px;margin-top:37px}.lc-hero-caption svg{color:#5a9871}.lc-hero-visual{position:relative;min-width:0}.lc-hero-preview{position:relative;z-index:1;transform:rotate(-1deg);animation:lc-enter 1s ease both}.lc-float-orb{position:absolute;border-radius:50%;filter:blur(35px);opacity:.65;pointer-events:none}.lc-orb-one{width:240px;height:240px;background:#c7e3c5;right:-70px;top:-55px}.lc-orb-two{width:180px;height:180px;background:#eddfc9;bottom:-40px;left:-45px}.lc-float-label{display:flex;align-items:center;gap:12px;position:absolute;right:-26px;bottom:-28px;z-index:2;background:#fff;border:1px solid #dfe8dd;border-radius:14px;padding:13px 18px;font-size:11px;font-weight:800;box-shadow:0 20px 48px #17312622;animation:lc-float 6s ease-in-out infinite}.lc-float-label small{display:block;font-weight:500;color:#879489;font-size:10px;margin-top:2px}.lc-float-icon{display:grid;place-items:center;width:32px;height:32px;border-radius:10px;color:#356b4b;background:#e7f1e4}.lc-hero-bottom{border-top:1px solid #dfe7dc;display:flex;align-items:center;justify-content:space-between;padding:18px 0;font-size:10px;letter-spacing:.15em;font-weight:750;color:#92a094}.lc-hero-bottom a{display:inline-flex;align-items:center;gap:8px;letter-spacing:0;font-size:12px;color:#54745c}
.lc-demo{overflow:hidden;border:1px solid #dce7dd;border-radius:17px;background:#fff;box-shadow:0 30px 90px #1731261c,0 5px 12px #17312610;color:#243a2e;min-width:0}.lc-demo-chrome{height:36px;background:#f7faf7;border-bottom:1px solid #e9efea;display:flex;justify-content:space-between;align-items:center;padding:0 14px;color:#a2b0a2;font-size:9px;letter-spacing:.09em;font-weight:800}.lc-window-dots{display:flex;gap:5px}.lc-window-dots i{width:7px;height:7px;border-radius:50%;background:#d2dcd2}.lc-window-dots i:first-child{background:#e6b2a4}.lc-window-dots i:nth-child(2){background:#e6d6a0}.lc-demo-live{background:#edf4eb;color:#538360;padding:4px 8px;border-radius:6px}.lc-demo-body{display:grid;grid-template-columns:48px minmax(0,1fr)}.lc-demo-rail{background:#18352a;color:#91af97;padding:18px 0;display:flex;align-items:center;flex-direction:column;gap:22px}.lc-demo-rail svg:first-child{color:#d9f4b3;margin-bottom:15px}.lc-demo-main{background:#fcfdfc;padding:22px;min-width:0}.lc-demo-titlebar{display:flex;align-items:center;justify-content:space-between;margin-bottom:15px;gap:15px}.lc-demo-titlebar h3{font-size:17px;margin:5px 0 2px;letter-spacing:-.035em;line-height:1.3}.lc-demo-titlebar p{font-size:11px;color:#9aab9d;margin:0}.lc-kicker{font-size:9px;font-weight:800;letter-spacing:.14em;color:#92aa95}.lc-demo-avatar{display:grid;place-items:center;width:35px;height:35px;background:#e9efdf;border-radius:10px;color:#527552;font-size:11px;font-weight:900}.lc-demo-tabs{display:inline-flex;padding:4px;gap:2px;background:#f0f4ef;border-radius:9px;border:1px solid #e3eae2}.lc-demo-tabs button{border:0;padding:7px 13px;font-size:11px;font-weight:700;color:#829186;background:transparent;border-radius:6px}.lc-demo-tabs button.is-active{background:#fff;color:#27643c;box-shadow:0 2px 5px #17312614}.lc-demo-cards{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:17px;animation:lc-enter .35s both}.lc-demo-kpi{background:#fff;border:1px solid #e7eee7;border-radius:10px;padding:15px}.lc-demo-kpi>span{display:block;font-size:11px;color:#879789}.lc-demo-kpi strong{display:block;font-size:25px;letter-spacing:-.06em;margin-top:5px}.lc-demo-kpi small{display:flex;align-items:center;gap:5px;color:#699578;font-size:10px;margin-top:6px}.lc-demo-chart{border:1px solid #e8eee7;border-radius:11px;padding:17px;margin-top:12px;background:#fff}.lc-chart-heading{display:flex;justify-content:space-between;align-items:center}.lc-chart-heading b{font-size:12px}.lc-chart-heading p{font-size:10px;color:#98a69b;margin:2px 0 0}.lc-chart-heading button{display:inline-flex;align-items:center;gap:8px;padding:7px 9px;border-radius:6px;background:#f4f7f3;border:1px solid #e3ece2;color:#6a796e;font-size:10px}.lc-chart-svg{width:100%;height:165px;margin-top:15px}.lc-chart-bottom{display:flex;align-items:center;gap:20px;flex-wrap:wrap;color:#88998c;font-size:10px}.lc-chart-bottom span{display:inline-flex;align-items:center;gap:6px}.lc-dot-green,.lc-dot-gold{display:inline-block;width:7px;height:7px;border-radius:50%;background:#376b4b}.lc-dot-gold{background:#d5a978}.lc-chart-bottom .lc-chart-data{margin-left:auto;color:#b0bcb0}.lc-demo-compact .lc-demo-main{padding:18px}.lc-demo-compact .lc-demo-kpi strong{font-size:21px}.lc-demo-compact .lc-chart-svg{height:133px}.lc-demo-compact .lc-demo-kpi{padding:12px}.lc-demo-compact .lc-demo-chart{padding:13px}.lc-demo-compact .lc-demo-rail{gap:18px}
.lc-strip{border-top:1px solid #e1e8de;border-bottom:1px solid #e1e8de;background:#fff}.lc-strip-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr))}.lc-strip-grid>div{padding:27px 22px;border-right:1px solid #e6ebe4;display:flex;gap:12px;align-items:center}.lc-strip-grid>div:first-child{padding-left:0}.lc-strip-grid>div:last-child{border-right:0}.lc-strip-grid span{font-size:12px;font-weight:800;color:#94bb93}.lc-strip-grid strong{font-size:12px;color:#4b5a50;font-weight:700}.lc-section{padding:112px 0}.lc-section-head{max-width:700px;margin-bottom:45px}.lc-section h2{font-size:clamp(32px,4.1vw,53px);letter-spacing:-.065em;line-height:1.17;margin:16px 0 19px;font-weight:800}.lc-section h2 span{color:#679477}.lc-section-head p,.lc-section p{color:#748278}.lc-section-head>p{max-width:620px;font-size:15px;line-height:1.85;margin:0}.lc-issues{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}.lc-issue{border:1px solid #e1e9df;border-radius:18px;background:#fff;padding:30px;min-height:290px;display:flex;flex-direction:column;transition:transform .3s,box-shadow .3s}.lc-issue:hover,.lc-module:hover,.lc-roadmap-card:hover{transform:translateY(-6px);box-shadow:0 18px 42px #17312614}.lc-issue-number{color:#a1baa4;font-weight:800;font-size:11px}.lc-issue-icon{width:54px;height:54px;display:grid;place-items:center;color:#3f7854;background:#eef5ea;border-radius:15px;margin-top:29px}.lc-issue h3,.lc-module h3{font-size:19px;letter-spacing:-.035em;margin:18px 0 8px}.lc-issue p,.lc-module p{font-size:13px;line-height:1.8;margin:0}.lc-issue-bottom{display:flex;gap:6px;align-items:center;font-size:9px;font-weight:800;letter-spacing:.12em;color:#9aaf9e;margin-top:auto;padding-top:23px}
.lc-workspace-section{background:#eaf1e8}.lc-workspace-heading{display:flex;align-items:end;justify-content:space-between;gap:60px;margin-bottom:43px}.lc-workspace-heading h2{margin-bottom:0}.lc-workspace-heading>p{max-width:310px;font-size:14px;line-height:1.85;margin:0 0 5px}.lc-workspace-stage{max-width:995px;margin-inline:auto}.lc-workspace-stage .lc-demo-body{grid-template-columns:66px minmax(0,1fr)}.lc-workspace-stage .lc-demo-main{padding:30px}.lc-workspace-stage .lc-demo-rail{gap:27px}.lc-workspace-stage .lc-demo-titlebar h3{font-size:23px}.lc-workspace-stage .lc-demo-kpi strong{font-size:32px}.lc-workspace-stage .lc-chart-svg{height:215px}.lc-workspace-note{display:flex;gap:8px;align-items:center;justify-content:center;margin-top:20px;color:#77917b;font-size:12px}.lc-filter-bar{display:flex;gap:8px;flex-wrap:wrap;margin:16px 0 28px}.lc-filter-bar button{border:1px solid #dfe8dc;background:#fff;color:#647368;padding:10px 18px;border-radius:9px;font-size:12px;font-weight:750;transition:background .2s,color .2s}.lc-filter-bar button.lc-filter-active{background:#173126;border-color:#173126;color:#fff}.lc-module-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:15px;animation:lc-enter .36s both}.lc-module{min-height:245px;border:1px solid #e0e8dd;background:#fff;border-radius:15px;padding:24px;display:flex;flex-direction:column;transition:transform .25s,box-shadow .25s}.lc-module-top{display:flex;align-items:center;justify-content:space-between}.lc-module-icon{display:grid;place-items:center;width:46px;height:46px;color:#3e7653;background:#eef4eb;border-radius:12px}.lc-module-index{font-size:11px;color:#bbc9bc;font-weight:800}.lc-module h3{font-size:17px;margin:23px 0 7px}.lc-module p{font-size:12px}.lc-module-category{align-self:flex-start;margin-top:auto;padding-top:20px;font-size:10px;font-weight:750;color:#5d956d}.lc-fineprint{font-size:12px;margin:22px 0 0;color:#97a299!important}
.lc-process{background:#173126;color:#fff}.lc-process h2{color:#fff}.lc-process h2 span{color:#bdd6b3}.lc-tag-light{color:#afd49c}.lc-process-head{max-width:760px}.lc-process-head>p{font-size:15px;color:#b8c9ba;line-height:1.8}.lc-steps{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:19px;margin-top:48px}.lc-step{position:relative;border-top:1px solid #4f6a55;padding-top:24px}.lc-step>span{font-size:12px;color:#b2d09d;font-weight:800}.lc-step-marker{width:38px;height:38px;border-radius:50%;display:grid;place-items:center;color:#173126;background:#d9f4b3;margin:20px 0 19px}.lc-step h3{font-size:19px;margin:0 0 9px}.lc-step p{color:#bdcbbf;font-size:12px;line-height:1.85;margin:0}.lc-roles-layout{display:grid;grid-template-columns:minmax(0,.92fr) minmax(0,1.08fr);gap:72px;align-items:center}.lc-roles-intro>p{font-size:14px;line-height:1.8;max-width:420px}.lc-role-picker{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:30px}.lc-role-picker button{border:1px solid #e1e8df;background:#fff;border-radius:10px;padding:13px 12px;display:flex;align-items:center;justify-content:space-between;color:#6f8074;font-size:12px;font-weight:700;text-align:left;transition:background .2s,color .2s,border-color .2s}.lc-role-picker button.lc-role-active{background:#173126;border-color:#173126;color:#fff}.lc-role-card{position:relative;min-height:490px;padding:40px;border-radius:22px;background:linear-gradient(150deg,#204936,#163126);color:#fff;overflow:hidden;box-shadow:0 27px 55px #17312622;animation:lc-enter .4s both}.lc-role-card:after{content:"";position:absolute;width:320px;height:320px;border:1px solid #ffffff1e;border-radius:50%;right:-125px;top:-145px;box-shadow:0 0 0 60px #ffffff05}.lc-role-card-header{display:flex;align-items:center;justify-content:space-between;font-size:10px;letter-spacing:.13em;color:#accdb2;font-weight:800;position:relative;z-index:1}.lc-role-card-mark{width:54px;height:54px;background:#d9f4b3;color:#173126;display:grid;place-items:center;border-radius:15px}.lc-role-code{display:inline-block;margin-top:65px;color:#b5d5ae;font-size:11px;letter-spacing:.15em;font-weight:800}.lc-role-card h3{font-size:39px;letter-spacing:-.055em;line-height:1.2;margin:8px 0}.lc-role-card>p{color:#c4d6c4;font-size:15px;margin:0}.lc-role-sublabel{font-size:10px;font-weight:800;letter-spacing:.13em;color:#a5c5a6;margin-top:31px}.lc-role-access{display:grid;gap:11px;margin-top:15px}.lc-role-access>div{display:flex;gap:10px;align-items:center;font-size:13px}.lc-role-access svg{color:#c2e6ae}.lc-role-bottom{display:flex;align-items:center;gap:10px;font-size:11px;color:#c0d5c1;border-top:1px solid #ffffff24;margin-top:30px;padding-top:20px}
.lc-control-section{background:#f0f5ee}.lc-control-layout{display:grid;grid-template-columns:.85fr 1.15fr;gap:90px}.lc-control-layout>div:first-child>p{font-size:15px;line-height:1.85}.lc-control-list{display:grid;gap:12px}.lc-control-item{display:flex;align-items:center;gap:18px;padding:20px 23px;background:#fff;border:1px solid #e1eade;border-radius:13px}.lc-control-item>span{width:46px;height:46px;display:grid;place-items:center;background:#e9f2e6;color:#43794c;border-radius:12px}.lc-control-item>div{flex:1}.lc-control-item h3{font-size:15px;margin:0 0 4px}.lc-control-item p{font-size:12px;margin:0;line-height:1.65}.lc-control-arrow{color:#a4b5a6}.lc-stack-layout{display:grid;grid-template-columns:1fr 1fr;gap:90px;align-items:center}.lc-stack-layout>div:first-child>p{font-size:15px;line-height:1.85}.lc-tech-pills{display:flex;gap:9px;flex-wrap:wrap;margin-top:28px}.lc-tech-pills span{border:1px solid #dee6da;padding:8px 13px;border-radius:7px;background:#fff;font-size:11px;font-weight:800;color:#55745f}.lc-stack-diagram{background:#f0f5ed;border:1px solid #dfe9dd;border-radius:20px;padding:34px;display:flex;flex-direction:column;align-items:center;gap:13px}.lc-stack-diagram>div{width:100%;border:1px solid #dce7da;border-radius:13px;background:#fff;padding:23px 25px;box-shadow:0 4px 12px #15312605}.lc-stack-diagram>div>span{display:block;color:#71a477;font-size:10px;font-weight:850;letter-spacing:.12em}.lc-stack-diagram strong{display:block;font-size:19px;letter-spacing:-.03em;margin:7px 0 3px}.lc-stack-diagram small{color:#849588;font-size:12px}.lc-stack-diagram>svg{color:#78a57e}.lc-roadmap{background:#edf3eb}.lc-roadmap-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px}.lc-roadmap-card{min-height:238px;padding:24px;background:#fff;border-radius:16px;border:1px solid #dce6d9;display:flex;flex-direction:column;transition:transform .25s,box-shadow .25s}.lc-roadmap-top{display:flex;justify-content:space-between;align-items:start;gap:8px}.lc-roadmap-top>span{font-size:18px;font-weight:850;color:#9eb39c}.lc-roadmap-top b{background:#f0f3ee;color:#809083;padding:5px 7px;border-radius:5px;font-size:9px;font-weight:800}.lc-roadmap-top b.lc-completed{background:#e3f4dd;color:#528454}.lc-roadmap-card h3{font-size:17px;margin:32px 0 8px;letter-spacing:-.03em}.lc-roadmap-card p{font-size:12px;line-height:1.7;margin:0 0 22px}.lc-roadmap-line{height:4px;border-radius:10px;background:#edf1eb;margin-top:auto;overflow:hidden}.lc-roadmap-line i{display:block;background:#81b783;height:100%;border-radius:10px}.lc-faq-layout{display:grid;grid-template-columns:.8fr 1.2fr;gap:90px}.lc-faq-layout>div:first-child>p{font-size:14px;line-height:1.85}.lc-faq-items{border-top:1px solid #dfe8dd}.lc-faq-item{border-bottom:1px solid #dfe8dd}.lc-faq-item summary{list-style:none;cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:15px;padding:22px 0;color:#2b4031;font-size:15px;font-weight:750}.lc-faq-item summary::-webkit-details-marker{display:none}.lc-faq-item summary svg{transition:transform .2s}.lc-faq-item[open] summary svg{transform:rotate(180deg)}.lc-faq-item p{font-size:13px;line-height:1.85;color:#738577;margin:-2px 25px 21px 0}.lc-final{background:#173126;position:relative;overflow:hidden}.lc-final:before{content:"";position:absolute;right:-110px;bottom:-350px;width:670px;height:670px;border-radius:50%;border:1px solid #ffffff20;box-shadow:0 0 0 80px #ffffff07,0 0 0 160px #ffffff04}.lc-final-inner{position:relative;z-index:1;padding:100px 0 110px}.lc-final h2{font-size:clamp(34px,5vw,65px);letter-spacing:-.07em;line-height:1.12;max-width:840px;margin:20px 0;color:#fff}.lc-final h2 em{font-style:normal;color:#cce7b2}.lc-final p{font-size:15px;color:#c1d1c2;max-width:600px;line-height:1.85;margin:0}.lc-final-inner>div{display:flex;gap:28px;align-items:center;margin-top:32px;flex-wrap:wrap}.lc-button-lime{background:#d9f4b3;color:#173126!important}.lc-button-lime:hover{background:#e8ffca}.lc-final-link{display:inline-flex;align-items:center;gap:9px;color:#e1f1d7!important;font-size:13px;font-weight:750}.lc-footer{background:#10291e;color:#b9cebb}.lc-footer-main{display:flex;justify-content:space-between;gap:70px;padding:64px 0 50px}.lc-footer-main>div{max-width:380px}.lc-footer-main p{font-size:13px;line-height:1.8;margin-top:18px;color:#aac1ae}.lc-footer-main nav{display:flex;align-items:start;flex-wrap:wrap;gap:26px;font-size:12px;font-weight:700}.lc-footer-main nav a:hover{color:#fff}.lc-footer-bottom{border-top:1px solid #ffffff18;padding:20px 0;display:flex;justify-content:space-between;gap:15px;color:#86a38b;font-size:11px}
@keyframes lc-enter{from{opacity:0;transform:translateY(15px)}to{opacity:1;transform:translateY(0)}}@keyframes lc-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}.lc .lc-reveal{transition:opacity .6s ease,transform .6s ease}.lc .lc-reveal.lc-shown{animation:lc-enter .55s ease both}
@media(max-width:1100px){.lc-nav{gap:15px}.lc-hero-grid{gap:25px}.lc-hero-copy h1{font-size:58px}.lc-hero-visual{margin-right:5px}.lc-module-grid{grid-template-columns:repeat(3,minmax(0,1fr))}.lc-roles-layout,.lc-control-layout,.lc-stack-layout,.lc-faq-layout{gap:45px}}
@media(max-width:850px){.lc-nav,.lc-signin,.lc-header-cta{display:none}.lc-header-actions{margin-left:auto}.lc-mobile-toggle{display:grid;place-items:center}.lc-mobile-menu{display:grid;gap:0;padding:8px 24px 20px;background:#f8faf6;border-top:1px solid #e2e9de}.lc-mobile-menu a{padding:13px 0;display:flex;justify-content:space-between;align-items:center;color:#284232;font-weight:700;border-bottom:1px solid #e5ece2}.lc-hero-grid{grid-template-columns:1fr;padding:65px 0;gap:40px}.lc-hero-copy h1{font-size:clamp(45px,7.4vw,70px)}.lc-hero-preview{max-width:630px;margin:auto}.lc-float-label{right:15px}.lc-strip-grid{grid-template-columns:1fr 1fr}.lc-strip-grid>div{border-bottom:1px solid #e6ebe4}.lc-issues{grid-template-columns:1fr 1fr}.lc-workspace-heading{display:block}.lc-workspace-heading>p{max-width:600px;margin-top:20px}.lc-module-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.lc-steps{grid-template-columns:repeat(3,minmax(0,1fr))}.lc-roles-layout,.lc-control-layout,.lc-stack-layout,.lc-faq-layout{grid-template-columns:1fr;gap:40px}.lc-roadmap-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:560px){.lc-container{width:min(100% - 34px,1180px)}.lc-header-inner{min-height:67px}.lc-brand{font-size:20px}.lc-brand-symbol{width:35px;height:35px}.lc-hero-grid{padding:48px 0 60px}.lc-hero-copy h1{font-size:clamp(42px,10vw,55px)}.lc-hero-copy>p{font-size:14px}.lc-hero-actions{gap:15px}.lc-hero-caption{font-size:11px}.lc-hero-preview{margin:0 -9px}.lc-demo-body{grid-template-columns:33px minmax(0,1fr)}.lc-demo-rail{padding:14px 0;gap:14px}.lc-demo-rail svg{width:15px;height:15px}.lc-demo-main,.lc-demo-compact .lc-demo-main{padding:11px}.lc-demo-titlebar h3{font-size:14px}.lc-demo-titlebar p{font-size:9px}.lc-demo-avatar{display:none}.lc-demo-tabs button{padding:7px;font-size:9px}.lc-demo-kpi,.lc-demo-compact .lc-demo-kpi{padding:9px}.lc-demo-kpi strong,.lc-demo-compact .lc-demo-kpi strong{font-size:17px}.lc-demo-kpi>span,.lc-demo-kpi small{font-size:8px}.lc-demo-chart,.lc-demo-compact .lc-demo-chart{padding:9px}.lc-chart-svg,.lc-demo-compact .lc-chart-svg{height:100px}.lc-chart-bottom .lc-chart-data{display:none}.lc-float-label{bottom:-23px;right:0;padding:9px 12px;font-size:9px}.lc-hero-bottom span:last-child{display:none}.lc-hero-bottom{font-size:9px}.lc-strip-grid>div{padding:18px 10px}.lc-strip-grid strong{font-size:11px}.lc-section{padding:76px 0}.lc-section h2{font-size:35px}.lc-issues,.lc-module-grid,.lc-roadmap-grid{grid-template-columns:1fr}.lc-issue{min-height:240px}.lc-workspace-stage .lc-demo-body{grid-template-columns:33px minmax(0,1fr)}.lc-workspace-stage .lc-demo-main{padding:11px}.lc-workspace-stage .lc-demo-kpi strong{font-size:18px}.lc-workspace-stage .lc-chart-svg{height:110px}.lc-workspace-stage .lc-demo-rail{gap:14px}.lc-steps{grid-template-columns:1fr 1fr}.lc-role-picker{grid-template-columns:1fr}.lc-role-card{min-height:0;padding:27px}.lc-role-card h3{font-size:30px}.lc-role-code{margin-top:42px}.lc-control-item{padding:16px}.lc-stack-diagram{padding:17px}.lc-final-inner{padding:80px 0}.lc-footer-main{display:block;padding:50px 0 32px}.lc-footer-main nav{margin-top:30px;gap:18px}.lc-footer-bottom{flex-direction:column}.lc-workspace-note{text-align:center;font-size:10px}}
@media(prefers-reduced-motion:reduce){.lc *, .lc *::before,.lc *::after{animation-duration:.01ms!important;transition-duration:.01ms!important;scroll-behavior:auto!important}}
`;
