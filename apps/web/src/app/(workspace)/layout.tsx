import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import LedgercoreVoltDashboard, {
  type RoleCode,
} from "../../components/dashboard/ledgercore-volt-dashboard";

const VALID_ROLES: readonly RoleCode[] = [
  "SUPER_ADMIN",
  "FINANCE_ADMIN",
  "ACCOUNTANT",
  "FINANCE_MANAGER",
  "AP_OFFICER",
  "AR_OFFICER",
  "AUDITOR",
];

async function logoutAction() {
  "use server";

  const supabase = await createClient();
  const { error } = await supabase.auth.signOut({ scope: "local" });
  if (error) throw new Error("Gagal keluar dari akun LedgerCore.");
  redirect("/login");
}

function StatusScreen({ title, description }: { title: string; description: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f3f5f9] px-5 text-[#29324b]">
      <section className="w-full max-w-md rounded-xl border border-[#dfe5ef] bg-white p-8 shadow-sm">
        <div className="text-xs font-semibold uppercase tracking-[.15em] text-[#168bb8]">LedgerCore</div>
        <h1 className="mt-3 text-2xl font-bold">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-[#7786a0]">{description}</p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link href="/dashboard" className="rounded-md bg-[#272c43] px-4 py-2.5 text-xs font-semibold text-white">Coba lagi</Link>
          <form action={logoutAction}>
            <button type="submit" className="rounded-md border border-[#dce2eb] px-4 py-2.5 text-xs font-semibold">Keluar</button>
          </form>
        </div>
      </section>
    </main>
  );
}

async function WorkspaceContent({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data: claimData, error: claimError } = await supabase.auth.getClaims();
  if (claimError || !claimData?.claims) redirect("/login");

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;
  if (sessionError || !accessToken) redirect("/login");

  const apiBase = (process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:4000/api/v1").replace(/\/$/, "");
  let response: Response;
  try {
    response = await fetch(`${apiBase}/auth/dashboard-access`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
  } catch {
    return <StatusScreen title="Backend tidak tersedia" description="Server NestJS belum bisa dihubungi. Periksa koneksi API LedgerCore dan coba lagi." />;
  }

  if (response.status === 401) redirect("/login");
  if (response.status === 403) return <StatusScreen title="Akses ditolak" description="Role akun belum diizinkan mengakses dashboard." />;
  if (!response.ok) return <StatusScreen title="Layanan belum tersedia" description="Backend mengalami kendala saat memverifikasi akses." />;

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    return <StatusScreen title="Data API tidak valid" description="Format respons hak akses backend tidak dapat dibaca." />;
  }

  if (!payload || typeof payload !== "object") {
    return <StatusScreen title="Hak akses belum terverifikasi" description="Respons dari backend tidak sesuai." />;
  }
  const result = payload as { status?: unknown; user?: unknown };
  if (result.status !== "authorized" || !result.user || typeof result.user !== "object") {
    return <StatusScreen title="Hak akses belum terverifikasi" description="Akun belum memiliki akses aktif yang dapat digunakan." />;
  }

  const user = result.user as { email?: unknown; role?: unknown };
  if (typeof user.role !== "string" || !VALID_ROLES.includes(user.role as RoleCode)) {
    return <StatusScreen title="Role belum dikenal" description="Role akun belum terdaftar pada kebijakan dashboard LedgerCore." />;
  }

  return (
    <LedgercoreVoltDashboard
      role={user.role as RoleCode}
      email={typeof user.email === "string" ? user.email : "Pengguna LedgerCore"}
      logoutAction={logoutAction}
    >
      {children}
    </LedgercoreVoltDashboard>
  );
}

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<StatusScreen title="Memuat dashboard" description="Sedang memeriksa sesi dan role akun LedgerCore..." />}>
      <WorkspaceContent>{children}</WorkspaceContent>
    </Suspense>
  );
}

