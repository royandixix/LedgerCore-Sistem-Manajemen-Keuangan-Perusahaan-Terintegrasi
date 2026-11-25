"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowDownUp,
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Copy,
  Download,
  Info,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import type { OrganizationsResult } from "../api/organizations.api";

type Props = { result: Exclude<OrganizationsResult, { status: "unauthorized" }> };

type SortBy = "newest" | "oldest" | "name";
const PAGE_SIZE = 8;

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Makassar",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function csvCell(value: string) {
  const escaped = /^[\s]*[=+\-@]/.test(value) ? `'${value}` : value;
  return `"${escaped.replaceAll('"', '""')}"`;
}

export default function OrganizationsOverview({ result }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [currency, setCurrency] = useState("SEMUA");
  const [sortBy, setSortBy] = useState<SortBy>("newest");
  const [page, setPage] = useState(1);
  const [showInfo, setShowInfo] = useState(false);
  const [notice, setNotice] = useState("");

  const organizations = useMemo(
    () => (result.status === "ready" ? result.organizations : []),
    [result],
  );
  const currencies = useMemo(
    () => Array.from(new Set(organizations.map((item) => item.defaultCurrency))).sort(),
    [organizations],
  );
  const filtered = useMemo(() => {
    const q = search.trim().toLocaleLowerCase("id-ID");
    return organizations
      .filter((item) =>
        (currency === "SEMUA" || item.defaultCurrency === currency) &&
        `${item.name} ${item.slug} ${item.defaultCurrency}`
          .toLocaleLowerCase("id-ID")
          .includes(q),
      )
      .sort((a, b) => {
        if (sortBy === "name") return a.name.localeCompare(b.name, "id-ID");
        const left = new Date(a.createdAt).getTime() || 0;
        const right = new Date(b.createdAt).getTime() || 0;
        return sortBy === "newest" ? right - left : left - right;
      });
  }, [organizations, search, currency, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function refresh() {
    setNotice("");
    startTransition(() => router.refresh());
  }

  async function copySlug(slug: string) {
    try {
      await navigator.clipboard.writeText(slug);
      setNotice(`Slug ${slug} berhasil disalin.`);
    } catch {
      setNotice("Tidak bisa menyalin otomatis. Silakan salin secara manual.");
    }
  }

  function exportCsv() {
    if (filtered.length === 0) return;
    const rows = [
      ["ID", "Nama Organisasi", "Slug", "Mata Uang", "Dibuat", "Diperbarui"],
      ...filtered.map((item) => [
        item.id, item.name, item.slug, item.defaultCurrency, item.createdAt, item.updatedAt,
      ]),
    ];
    const contents = `\ufeff${rows.map((row) => row.map(csvCell).join(",")).join("\r\n")}`;
    const url = URL.createObjectURL(new Blob([contents], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "ledgercore-organizations.csv";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice(`Ekspor ${filtered.length} organisasi berhasil diproses.`);
  }

  function renderState() {
    if (result.status === "forbidden") {
      return (
        <section role="alert" className="rounded-lg border border-[#f5d2d3] bg-white p-7 text-[#303b56] shadow-sm">
          <ShieldCheck className="text-[#cc5361]" size={28} />
          <h2 className="mt-3 text-xl font-bold">Akses dibatasi</h2>
          <p className="mt-2 text-sm leading-6 text-[#75829a]">
            Modul Manajemen Organisasi hanya tersedia untuk Super Admin.
            Otorisasi diperiksa oleh API NestJS, bukan hanya sidebar.
          </p>
        </section>
      );
    }
    if (result.status === "unavailable") {
      return (
        <section role="alert" className="rounded-lg border border-[#f1d4a9] bg-white p-7 text-[#303b56] shadow-sm">
          <AlertCircle className="text-[#c28632]" size={28} />
          <h2 className="mt-3 text-xl font-bold">Data organisasi belum dapat dimuat</h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-[#75829a]">
            API belum bisa menyediakan daftar organisasi. Dari pemeriksaan database sebelumnya,
            tabel organisasi belum tersedia di Supabase. Periksa migrasi serta koneksi backend
            sebelum mengaktifkan penambahan data.
          </p>
          <button type="button" onClick={refresh} disabled={isPending}
            className="mt-5 inline-flex items-center gap-2 rounded-md bg-[#29314c] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#394461] disabled:opacity-50">
            <RefreshCw size={15} className={isPending ? "animate-spin" : ""} /> Coba lagi
          </button>
        </section>
      );
    }
    if (organizations.length === 0) {
      return (
        <div className="flex flex-col items-center rounded-lg border border-dashed border-[#ced8e7] bg-white px-6 py-16 text-center">
          <Building2 size={36} className="text-[#9aa7bc]" />
          <h3 className="mt-4 text-lg font-semibold">Belum ada organisasi</h3>
          <p className="mt-2 max-w-lg text-sm text-[#8090aa]">
            API berhasil diakses, tetapi belum ada data organisasi yang tersimpan.
          </p>
        </div>
      );
    }
    if (filtered.length === 0) {
      return <p className="py-12 text-center text-sm text-[#8290a8]">Tidak ada organisasi sesuai filter.</p>;
    }
    return (
      <>
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[680px] text-left">
            <thead className="border-y border-[#e8ecf3] bg-[#f6f8fb] text-[11px] uppercase text-[#586780]">
              <tr>
                <th scope="col" className="px-5 py-3">Organisasi</th>
                <th scope="col" className="px-4 py-3">Mata uang</th>
                <th scope="col" className="px-4 py-3">Dibuat</th>
                <th scope="col" className="px-4 py-3">Diperbarui</th>
                <th scope="col" className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((item) => (
                <tr key={item.id} className="border-b border-[#edf1f6] text-[12px] hover:bg-[#f8fbff]">
                  <td className="px-5 py-4">
                    <div className="font-semibold text-[#2c3754]">{item.name}</div>
                    <div className="mt-1 max-w-[280px] truncate text-[11px] text-[#8391aa]">{item.slug}</div>
                  </td>
                  <td className="px-4 py-4 font-semibold text-[#596c90]">{item.defaultCurrency}</td>
                  <td className="px-4 py-4 text-[#6d7b93]">{formatDate(item.createdAt)}</td>
                  <td className="px-4 py-4 text-[#6d7b93]">{formatDate(item.updatedAt)}</td>
                  <td className="px-4 py-4 text-right">
                    <button type="button" onClick={() => void copySlug(item.slug)}
                      className="inline-flex items-center gap-1.5 rounded-md border border-[#dae2ef] bg-white px-3 py-2 text-[11px] font-semibold hover:bg-[#f0f7ff]">
                      <Copy size={13} /> Salin slug
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="grid gap-3 p-4 md:hidden">
          {visible.map((item) => (
            <article key={item.id} className="rounded-lg border border-[#e2e8f0] bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="break-words text-sm font-bold">{item.name}</h3>
                  <p className="mt-1 break-all text-xs text-[#8796ad]">{item.slug}</p>
                </div>
                <span className="rounded-md bg-[#e7f6fd] px-2 py-1 text-xs font-semibold text-[#19769a]">{item.defaultCurrency}</span>
              </div>
              <p className="mt-4 text-xs text-[#74839d]">Dibuat: {formatDate(item.createdAt)}</p>
              <button type="button" onClick={() => void copySlug(item.slug)} className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#158ab7]">
                <Copy size={13} /> Salin slug
              </button>
            </article>
          ))}
        </div>
      </>
    );
  }

  return (
    <div className="space-y-5 text-[#2d3650]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold text-[#8c9ab1]">LedgerCore / Workspace / Administrasi</p>
          <h1 className="mt-1 text-[24px] font-bold tracking-tight">Manajemen Organisasi</h1>
          <p className="mt-2 text-[12px] leading-6 text-[#7a8aa3]">Kelola daftar perusahaan dalam sistem Enterprise Finance.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={refresh} disabled={isPending}
            className="inline-flex h-10 items-center gap-2 rounded-md border border-[#d2d9e7] bg-white px-3 text-xs font-semibold hover:bg-[#f5f9fe] disabled:opacity-50">
            <RefreshCw size={15} className={isPending ? "animate-spin" : ""} /> Refresh
          </button>
          <button type="button" onClick={() => setShowInfo(true)}
            className="inline-flex h-10 items-center gap-2 rounded-md bg-[#2a314b] px-4 text-xs font-semibold text-white hover:bg-[#3b4765]">
            <Plus size={16} /> Tambah Organisasi
          </button>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-3" aria-label="Ringkasan organisasi">
        <div className="flex min-h-28 items-center gap-4 rounded-lg border border-[#e1e6ef] bg-white px-5 py-4 shadow-sm">
          <span className="grid size-12 shrink-0 place-items-center rounded-md bg-[#e7f5fd] text-[#229ac5]"><Building2 size={22} /></span>
          <div><p className="text-[12px] text-[#7e8da4]">Organisasi dimuat</p><p className="mt-1 text-[25px] font-bold">{result.status === "ready" ? organizations.length : "—"}</p></div>
        </div>
        <div className="flex min-h-28 items-center gap-4 rounded-lg border border-[#e1e6ef] bg-white px-5 py-4 shadow-sm">
          <span className="grid size-12 shrink-0 place-items-center rounded-md bg-[#e7f8f2] text-[#199f87]"><CircleDollarSign size={22} /></span>
          <div><p className="text-[12px] text-[#7e8da4]">Organisasi IDR</p><p className="mt-1 text-[25px] font-bold">{result.status === "ready" ? organizations.filter((item) => item.defaultCurrency === "IDR").length : "—"}</p></div>
        </div>
        <div className="flex min-h-28 items-center gap-4 rounded-lg border border-[#e1e6ef] bg-white px-5 py-4 shadow-sm">
          <span className="grid size-12 shrink-0 place-items-center rounded-md bg-[#f2efff] text-[#8470c8]"><CheckCircle2 size={22} /></span>
          <div><p className="text-[12px] text-[#7e8da4]">Status koneksi API</p><p className="mt-2 text-[13px] font-bold">{result.status === "ready" ? "Terhubung" : result.status === "forbidden" ? "Akses ditolak" : "Belum tersedia"}</p></div>
        </div>
      </section>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.8fr)_minmax(260px,.65fr)]">
        <section className="min-w-0 overflow-hidden rounded-lg border border-[#e1e6ef] bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e9edf4] p-4 sm:p-5">
            <div><h2 className="text-[15px] font-bold">Daftar organisasi</h2><p className="mt-1 text-[11px] text-[#8b98ac]">Data dari NestJS · maks. 50 organisasi per permintaan</p></div>
            <button type="button" onClick={exportCsv} disabled={result.status !== "ready" || filtered.length === 0}
              className="inline-flex h-9 items-center gap-2 rounded-md border border-[#d7e0ec] px-3 text-xs font-semibold hover:bg-[#f3f9ff] disabled:cursor-not-allowed disabled:opacity-40">
              <Download size={15} /> Ekspor CSV
            </button>
          </div>

          {result.status === "ready" && (
            <div className="grid gap-3 border-b border-[#e9edf4] p-4 sm:grid-cols-[minmax(180px,1fr)_160px_155px] sm:p-5">
              <label className="relative block">
                <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8b9ab0]" />
                <input type="search" aria-label="Cari organisasi" placeholder="Cari nama atau slug..." value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }}
                  className="h-10 w-full rounded-md border border-[#d8e1ed] bg-white pl-10 pr-3 text-xs outline-none focus:border-[#40b6e0] focus:ring-2 focus:ring-[#40b6e0]/20" />
              </label>
              <label className="sr-only" htmlFor="organization-currency">Mata uang</label>
              <select id="organization-currency" value={currency} onChange={(event) => { setCurrency(event.target.value); setPage(1); }}
                className="h-10 rounded-md border border-[#d8e1ed] bg-white px-3 text-xs">
                <option value="SEMUA">Semua mata uang</option>
                {currencies.map((code) => <option key={code} value={code}>{code}</option>)}
              </select>
              <label className="relative block">
                <ArrowDownUp size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8b9ab0]" />
                <span className="sr-only">Urutkan organisasi</span>
                <select value={sortBy} onChange={(event) => { setSortBy(event.target.value as SortBy); setPage(1); }}
                  className="h-10 w-full appearance-none rounded-md border border-[#d8e1ed] bg-white pl-3 pr-9 text-xs">
                  <option value="newest">Terbaru</option><option value="oldest">Terlama</option><option value="name">Nama A–Z</option>
                </select>
              </label>
            </div>
          )}

          {notice && <div role="status" className="flex items-center justify-between gap-3 border-b border-[#d0eaf1] bg-[#edfaff] px-5 py-3 text-xs text-[#30637b]"><span>{notice}</span><button type="button" aria-label="Tutup pesan" onClick={() => setNotice("")}><X size={15} /></button></div>}

          {renderState()}

          {result.status === "ready" && filtered.length > PAGE_SIZE && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e8edf3] px-4 py-3 text-xs text-[#8290a6] sm:px-5">
              <span>Menampilkan {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} dari {filtered.length}</span>
              <div className="flex items-center gap-2">
                <button type="button" aria-label="Halaman sebelumnya" disabled={currentPage === 1} onClick={() => setPage((v) => Math.max(1, v - 1))} className="rounded-md border p-2 disabled:opacity-30"><ChevronLeft size={16} /></button>
                <span>Halaman {currentPage}/{totalPages}</span>
                <button type="button" aria-label="Halaman berikutnya" disabled={currentPage >= totalPages} onClick={() => setPage((v) => Math.min(totalPages, v + 1))} className="rounded-md border p-2 disabled:opacity-30"><ChevronRight size={16} /></button>
              </div>
            </div>
          )}
        </section>
        <aside className="space-y-4">
          <div className="rounded-lg border border-[#e1e6ef] bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2"><ShieldCheck size={19} className="text-[#209987]" /><h2 className="text-[14px] font-bold">Keamanan organisasi</h2></div>
            <p className="mt-3 text-xs leading-6 text-[#7e8ca4]">Endpoint daftar organisasi dibatasi untuk Super Admin melalui AuthGuard dan PermissionsGuard NestJS.</p>
            <p className="mt-4 rounded-md bg-[#f3f8fc] p-3 text-[11px] leading-5 text-[#66809c]">Pembatasan menu bukan pengganti otorisasi API. Semua aksi tulis perlu divalidasi backend.</p>
          </div>
          <div className="rounded-lg border border-[#e1e6ef] bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2"><Info size={19} className="text-[#209ac6]" /><h2 className="text-[14px] font-bold">Tahap implementasi</h2></div>
            <p className="mt-3 text-xs leading-6 text-[#7e8ca4]">Daftar, pencarian, filter, urutan, ekspor dan refresh sudah tersedia pada UI. Fitur tambah/edit menunggu migrasi tabel dan pengujian akses tulis.</p>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-[#1694bb]">Fokus: data asli, bukan data contoh <ArrowRight size={14} /></div>
          </div>
        </aside>
      </div>

      {showInfo && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#151d35]/70 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowInfo(false); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="organization-create-title" className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3"><h2 id="organization-create-title" className="text-lg font-bold">Tambah Organisasi</h2><button type="button" aria-label="Tutup dialog" onClick={() => setShowInfo(false)}><X size={19} /></button></div>
            <p className="mt-4 text-sm leading-7 text-[#73829c]">Form penyimpanan belum diaktifkan. Tabel Organizations di Supabase belum diterapkan pada pemeriksaan terakhir, dan operasi tulis perlu diuji sebelum digunakan.</p>
            <button type="button" autoFocus onClick={() => setShowInfo(false)} className="mt-6 w-full rounded-md bg-[#29314b] px-4 py-3 text-xs font-semibold text-white">Mengerti</button>
          </section>
        </div>
      )}
    </div>
  );
}
