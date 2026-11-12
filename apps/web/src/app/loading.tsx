export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div
        role="status"
        aria-live="polite"
        className="flex flex-col items-center gap-5"
      >
        <div className="relative flex h-16 w-16 items-center justify-center">
          <div className="absolute h-16 w-16 rounded-full border-4 border-slate-200" />

          <div className="absolute h-16 w-16 animate-spin rounded-full border-4 border-transparent border-t-blue-600" />

          <span className="text-xl font-bold text-blue-600">L</span>
        </div>

        <div className="text-center">
          <h2 className="text-lg font-semibold text-slate-900">LedgerCore</h2>

          <p className="mt-2 text-sm text-slate-500">
            Memuat sistem keuangan perusahaan...
          </p>
        </div>

        <span className="sr-only">Halaman sedang dimuat</span>
      </div>
    </main>
  );
}
