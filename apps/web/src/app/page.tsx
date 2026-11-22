import type { Metadata } from "next";
import LedgercoreLanding from "../components/landing/ledgercore-landing";

export const metadata: Metadata = {
  title: "LedgerCore — Sistem Manajemen Keuangan Perusahaan Terintegrasi",
  description:
    "LedgerCore dirancang untuk menghubungkan pencatatan akuntansi, transaksi, persetujuan, pelaporan, dan audit dalam satu lingkungan kerja perusahaan.",
};

export default function HomePage() {
  return <LedgercoreLanding />;
}
