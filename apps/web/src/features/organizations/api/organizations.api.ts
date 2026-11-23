// Diimpor hanya dari Server Component untuk mencegah akses token tersebar ke browser.
export type Organization = {
  id: string;
  name: string;
  slug: string;
  defaultCurrency: string;
  createdAt: string;
  updatedAt: string;
};

export type OrganizationsResult =
  | { status: "ready"; organizations: Organization[] }
  | { status: "unauthorized" }
  | { status: "forbidden" }
  | { status: "unavailable" };

function isOrganization(value: unknown): value is Organization {
  if (typeof value !== "object" || value === null) return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.id === "string" &&
    typeof record.name === "string" &&
    typeof record.slug === "string" &&
    typeof record.defaultCurrency === "string" &&
    typeof record.createdAt === "string" &&
    typeof record.updatedAt === "string"
  );
}

export async function getOrganizations(
  accessToken: string,
): Promise<OrganizationsResult> {
  const apiBase = (process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:4000/api/v1")
    .replace(/\/+$/, "");

  try {
    const response = await fetch(`${apiBase}/organizations`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });

    if (response.status === 401) return { status: "unauthorized" };
    if (response.status === 403) return { status: "forbidden" };
    if (!response.ok) return { status: "unavailable" };

    const payload: unknown = await response.json();
    if (!Array.isArray(payload) || !payload.every(isOrganization)) {
      return { status: "unavailable" };
    }

    // GET saat ini dibatasi 50 record oleh OrganizationsService.
    return { status: "ready", organizations: payload };
  } catch {
    return { status: "unavailable" };
  }
}
