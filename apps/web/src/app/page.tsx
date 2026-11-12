"use client";

import { useEffect, useState } from "react";

type ApiStatus = "checking" | "online" | "offline";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:4000/api/v1";

const modules = [
  {
    number: "01",
    title: "General Ledger",
    description:
      "Chart of Accounts, journal entries, posting, dan buku besar perusahaan.",
  },
  {
    number: "02",
    title: "Financial Operations",
    description:
      "Invoice, pengeluaran, utang, piutang, dan transaksi keuangan.",
  },
  {
    number: "03",
    title: "Financial Control",
    description: "Approval, rekonsiliasi, audit trail, dan laporan keuangan.",
  },
];

const technologies = [
  ["Frontend", "Next.js + TypeScript"],
  ["Backend", "NestJS REST API"],
  ["Database", "Supabase PostgreSQL"],
  ["ORM", "Prisma"],
  ["Authentication", "Supabase Auth"],
];

export default function HomePage() {
  const [apiStatus, setApiStatus] = useState<ApiStatus>("checking");

  useEffect(() => {
    const controller = new AbortController();

    async function checkHealth() {
      try {
        const response = await fetch(`${API_URL}/health`, {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("API unavailable");
        }

        const data = (await response.json()) as {
          status?: string;
        };

        if (!controller.signal.aborted) {
          setApiStatus(data.status === "ok" ? "online" : "offline");
        }
      } catch {
        if (!controller.signal.aborted) {
          setApiStatus("offline");
        }
      }
    }

    void checkHealth();

    return () => controller.abort();
  }, []);

  const labels = {
    checking: "Memeriksa API",
    online: "API terhubung",
    offline: "API belum terhubung",
  };

  const indicator = {
    checking: "bg-amber-400",
    online: "bg-emerald-400",
    offline: "bg-rose-400",
  };

  return (
    <main className="min-h-screen bg-[#0a1728] text-slate-100">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#d8ad66] text-2xl font-bold text-[#0a1728]">
              L
            </div>

            <div>
              <div className="text-xl font-bold tracking-tight">LedgerCore</div>

              <div className="text-[10px] font-semibold tracking-[0.18em] text-slate-400">
                ENTERPRISE FINANCE
              </div>
            </div>
          </div>

          <div
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-300"
            aria-live="polite"
          >
            <span className={`h-2 w-2 rounded-full ${indicator[apiStatus]}`} />
            {labels[apiStatus]}
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-24 top-0 h-96 w-96 rounded-full bg-blue-800/20 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-6 py-24 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <span className="border-l-2 border-[#d8ad66] pl-4 text-xs font-bold uppercase tracking-[0.18em] text-[#d8ad66]">
              Enterprise Financial Platform
            </span>

            <h1 className="mt-8 text-5xl font-semibold leading-[1.1] tracking-tight sm:text-6xl">
              Financial operations.
              <span className="mt-3 block text-[#d8ad66]">
                Built for control.
              </span>
            </h1>

            <p className="mt-8 max-w-xl text-base leading-8 text-slate-400">
              Platform pengelolaan keuangan perusahaan yang mengintegrasikan
              pencatatan akuntansi, transaksi, persetujuan, dan laporan dalam
              satu sistem terpusat.
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <a
                href="#modules"
                className="rounded-md bg-[#d8ad66] px-6 py-3 text-sm font-bold text-[#0a1728] transition hover:bg-[#ecc98f]"
              >
                Jelajahi Platform
              </a>

              <a
                href="#technology"
                className="rounded-md border border-white/20 px-6 py-3 text-sm font-semibold transition hover:bg-white/10"
              >
                Technology Stack
              </a>
            </div>
          </div>

          <aside
            id="technology"
            className="rounded-xl border border-white/10 bg-[#11243b] p-7 shadow-2xl shadow-black/20"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-5">
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-500">
                  System Architecture
                </p>

                <h2 className="mt-2 text-xl font-semibold">
                  Project Foundation
                </h2>
              </div>

              <span className="rounded-md bg-[#d8ad66]/10 px-3 py-2 text-xs font-bold text-[#d8ad66]">
                STAGE 01
              </span>
            </div>

            <div className="mt-7 space-y-5">
              {technologies.map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-4 border-b border-white/5 pb-4 last:border-0"
                >
                  <span className="text-sm text-slate-400">{label}</span>

                  <strong className="text-right text-sm font-medium">
                    {value}
                  </strong>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section
        id="modules"
        className="border-t border-white/10 bg-[#0e2034] py-20"
      >
        <div className="mx-auto max-w-7xl px-6">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#d8ad66]">
            Financial Architecture
          </span>

          <h2 className="mt-4 text-3xl font-bold">
            Fondasi sistem keuangan perusahaan
          </h2>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-400">
            Tiga domain utama yang akan dikembangkan melalui arsitektur backend
            modular.
          </p>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {modules.map((module) => (
              <article
                key={module.number}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-8 transition duration-300 hover:-translate-y-1 hover:border-[#d8ad66]/40 hover:bg-white/[0.06]"
              >
                <span className="text-sm font-bold text-[#d8ad66]">
                  {module.number}
                </span>

                <h3 className="mt-8 text-xl font-semibold">{module.title}</h3>

                <p className="mt-4 text-sm leading-7 text-slate-400">
                  {module.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 py-8">
        <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-3 px-6 text-xs text-slate-500">
          <span>© {new Date().getFullYear()} LedgerCore</span>

          <span>Enterprise Financial Management System</span>
        </div>
      </footer>
    </main>
  );
}
