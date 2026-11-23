import Link from "next/link";

export default function Page() {
  return (
    <main className="min-h-screen bg-[#f5f7f3] px-6 py-12 text-[#172621]">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/dashboard"
          className="text-sm font-medium text-[#4b8058] hover:underline"
        >
          ← Kembali ke Dashboard
        </Link>

        <section className="mt-8 rounded-3xl border border-[#e2e8e1] bg-white p-8 shadow-sm">
          <span className="text-xs font-bold uppercase tracking-widest text-[#63846b]">
            LedgerCore Workspace
          </span>

          <h1 className="mt-4 text-3xl font-bold">
            Pengaturan Sistem
          </h1>

          <p className="mt-4 text-sm leading-7 text-[#748078]">
            Modul ini sedang dalam tahap pengembangan.
            Fitur dan integrasi API akan ditambahkan
            pada tahap berikutnya.
          </p>
        </section>
      </div>
    </main>
  );
}
