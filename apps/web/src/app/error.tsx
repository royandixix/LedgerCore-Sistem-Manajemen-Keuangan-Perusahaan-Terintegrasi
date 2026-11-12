"use client";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">
          Terjadi Kesalahan
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-600">
          Sistem LedgerCore mengalami kendala saat memuat halaman. Silakan coba
          kembali.
        </p>

        {process.env.NODE_ENV === "development" && (
          <p className="mt-4 break-words rounded-lg bg-slate-100 p-3 text-left text-xs text-slate-600">
            {error.message}
          </p>
        )}

        <button
          type="button"
          onClick={() => reset()}
          className="mt-6 w-full rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-700"
        >
          Coba Lagi
        </button>
      </div>
    </main>
  );
}
