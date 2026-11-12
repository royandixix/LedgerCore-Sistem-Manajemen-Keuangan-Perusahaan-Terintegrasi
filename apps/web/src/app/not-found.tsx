import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-lg text-center">
        <div className="mb-6 inline-flex rounded-full bg-blue-50 px-5 py-2 text-sm font-semibold text-blue-700">
          LedgerCore Enterprise
        </div>

        <h1 className="text-7xl font-bold tracking-tight text-slate-900">
          404
        </h1>

        <h2 className="mt-5 text-2xl font-semibold text-slate-900">
          Halaman Tidak Ditemukan
        </h2>

        <p className="mt-4 text-sm leading-7 text-slate-600">
          Halaman yang Anda cari tidak tersedia atau alamat yang dimasukkan
          tidak sesuai. Silakan kembali ke halaman utama LedgerCore.
        </p>

        <div className="mt-8 flex justify-center">
          <Link
            href="/"
            className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Kembali ke Beranda
          </Link>
        </div>

        <p className="mt-10 text-xs text-slate-400">
          LedgerCore — Enterprise Financial Management System
        </p>
      </div>
    </main>
  );
}
