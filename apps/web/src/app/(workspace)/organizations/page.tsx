import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";
import { getOrganizations } from "../../../features/organizations/api/organizations.api";
import OrganizationsOverview from "../../../features/organizations/components/organizations-overview";

function OrganizationsLoading() {
  return (
    <div className="space-y-5 animate-pulse" aria-label="Memuat organisasi">
      <div className="h-24 rounded-lg bg-[#e4eaf3]" />
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="h-28 rounded-lg bg-[#e4eaf3]" />
        <div className="h-28 rounded-lg bg-[#e4eaf3]" />
        <div className="h-28 rounded-lg bg-[#e4eaf3]" />
      </div>
      <div className="h-72 rounded-lg bg-[#e4eaf3]" />
    </div>
  );
}

async function OrganizationsContent() {
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims) {
    redirect("/login");
  }

  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;

  if (!accessToken) {
    redirect("/login");
  }

  // Token tidak pernah dikirim ke komponen klien. API NestJS memeriksa SUPER_ADMIN.
  const result = await getOrganizations(accessToken);
  if (result.status === "unauthorized") {
    redirect("/login");
  }

  return <OrganizationsOverview result={result} />;
}

export default function OrganizationsPage() {
  return (
    <Suspense fallback={<OrganizationsLoading />}>
      <OrganizationsContent />
    </Suspense>
  );
}
