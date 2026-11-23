import Link from "next/link";
import { ArrowRight, Clock3, ShieldCheck } from "lucide-react";

export default function Page() {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold text-[#8090aa]">LedgerCore / Workspace</p>
          <h1 className="mt-1 text-[23px] font-bold tracking-tight text-[#29314b]">Buku Besar</h1>
        </div>
        <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-md border border-[#d5ddea] bg-white px-3 py-2 text-xs font-semibold text-[#324361] hover:bg-[#f5f8fc]">
          Overview <ArrowRight size={15} />
        </Link>
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.7fr)_minmax(260px,.8fr)]">
        <section className="rounded-lg border border-[#e0e5ed] bg-white p-6 shadow-sm sm:p-8">
          <div className="inline-flex items-center gap-2 rounded-md bg-[#e4f7ff] px-3 py-2 text-xs font-semibold text-[#147ea5]"><Clock3 size={15} /> Dalam pengembangan</div>
          <h2 className="mt-5 text-xl font-bold text-[#29324b]">Buku Besar</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#71819b]">Modul ini belum memiliki implementasi bisnis yang lengkap. Tampilan workspace sudah terintegrasi; fungsi dan data asli akan ditambahkan setelah API serta kontrol izin selesai diuji.</p>
        </section>
        <aside className="rounded-lg border border-[#e0e5ed] bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-bold text-[#29324b]"><ShieldCheck size={17} className="text-[#169d92]" /> Status Modul</div>
          <p className="mt-3 text-xs leading-6 text-[#7e8ca3]">Navigasi aktif. Data keuangan belum ditampilkan dan operasi bisnis belum diaktifkan pada halaman ini.</p>
          <Link href="/dashboard" className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-[#128db6] hover:underline">Kembali ke Dashboard <ArrowRight size={14} /></Link>
        </aside>
      </div>
    </div>
  );
}
