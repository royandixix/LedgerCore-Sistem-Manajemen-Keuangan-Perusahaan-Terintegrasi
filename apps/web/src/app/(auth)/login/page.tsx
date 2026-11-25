"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
  Layers3,
  ArrowUpRight,
  ArrowLeft,
  Eye,
  EyeOff,
  ShieldCheck,
  LoaderCircle,
} from "lucide-react";
import { loginWithPassword } from "./actions";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const result = await loginWithPassword({
        email: email.trim(),
        password,
      });

      if (!result.ok) {
        setError(result.message);
        return;
      }

      window.location.replace("/dashboard");
    } catch {
      setError("Layanan autentikasi tidak tersedia. Silakan coba kembali.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-[#f8faf5] text-[#172621] lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-[#172621] p-16 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute right-[-140px] top-[-140px] h-[460px] w-[460px] rounded-full border border-white/10" />

        <div className="pointer-events-none absolute bottom-[-160px] left-[-120px] h-[500px] w-[500px] rounded-full bg-[#779b64]/15 blur-3xl" />

        <Link
          href="/"
          className="relative flex items-center gap-3 text-2xl font-bold"
        >
          <Layers3 className="text-[#d4f6a4]" />
          ledgercore.
        </Link>

        <div className="relative max-w-lg">
          <p className="mb-6 text-xs font-semibold tracking-[0.2em] text-[#d4f6a4]">
            ENTERPRISE FINANCIAL WORKSPACE
          </p>

          <h1 className="text-6xl font-semibold leading-[1.08] tracking-tight">
            Keuangan jelas.
            <span className="mt-2 block text-[#d4f6a4]">
              Keputusan lebih tepat.
            </span>
          </h1>

          <p className="mt-7 text-base leading-8 text-white/60">
            Satu ruang kerja untuk pengelolaan akuntansi, transaksi,
            persetujuan, dan pelaporan keuangan perusahaan.
          </p>

          <div className="mt-10 flex items-center gap-3 text-sm text-white/70">
            <ShieldCheck className="text-[#d4f6a4]" />
            Akses berdasarkan peran pengguna
          </div>
        </div>

        <p className="relative text-xs text-white/40">
          LedgerCore — Sistem Manajemen Keuangan Perusahaan Terintegrasi.
        </p>
      </section>

      <section className="flex min-h-screen flex-col justify-center px-6 py-12 sm:px-12">
        <div className="mx-auto w-full max-w-[420px]">
          <Link
            href="/"
            className="mb-12 inline-flex items-center gap-2 text-sm text-[#607366] transition hover:text-[#172621]"
          >
            <ArrowLeft size={16} />
            Kembali ke beranda
          </Link>

          <div className="mb-9">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#172621] text-[#d4f6a4]">
              <Layers3 size={25} />
            </div>

            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#748677]">
              LedgerCore Workspace
            </p>

            <h2 className="mt-3 text-4xl font-bold tracking-tight">
              Selamat datang.
            </h2>

            <p className="mt-4 text-sm leading-7 text-[#748078]">
              Masuk menggunakan akun perusahaan untuk mengakses ruang kerja
              Anda.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold"
              >
                Alamat email
              </label>

              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="nama@perusahaan.com"
                required
                disabled={loading}
                className="h-14 w-full rounded-xl border border-[#dde4db] bg-white px-4 text-sm outline-none transition focus:border-[#63846b] focus:ring-4 focus:ring-[#63846b]/10"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold"
              >
                Password
              </label>

              <div className="relative">
                <input
                  id="password"
                  type={visible ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Masukkan password"
                  required
                  disabled={loading}
                  className="h-14 w-full rounded-xl border border-[#dde4db] bg-white px-4 pr-12 text-sm outline-none transition focus:border-[#63846b] focus:ring-4 focus:ring-[#63846b]/10"
                />

                <button
                  type="button"
                  onClick={() => setVisible(!visible)}
                  aria-label={
                    visible ? "Sembunyikan password" : "Tampilkan password"
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#748078]"
                >
                  {visible ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-[#172621] text-sm font-semibold text-white transition hover:bg-[#30493a] disabled:opacity-60"
            >
              {loading ? (
                <>
                  <LoaderCircle size={18} className="animate-spin" />
                  Memverifikasi akun...
                </>
              ) : (
                <>
                  Masuk ke LedgerCore
                  <ArrowUpRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 border-t border-[#e0e7dd] pt-7">
            <div className="flex items-center gap-2 text-xs text-[#758578]">
              <ShieldCheck size={16} />
              Autentikasi dan pengendalian hak akses
            </div>

            <p className="mt-4 text-xs leading-6 text-[#758578]">
              Gunakan akun yang telah terdaftar dan mendapatkan hak akses dari
              administrator.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
