import "server-only";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { isPlatformAdmin } from "@/lib/auth-paths";
import { createClient } from "@/lib/supabase/server";

/**
 * Data Access Layer for auth. Every page and data function that needs a user
 * calls one of these, close to the data. Layout checks alone are not enough.
 */

export type CurrentUser = {
  id: string;
  email: string | null;
  isAdmin: boolean;
};

export type Membership = {
  tenantId: string;
  tenantName: string;
  role: "agency_admin" | "owner" | "staff";
};

/** The signed-in user, or null. Verified (getClaims checks the token). */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims?.sub) return null;
  const email =
    typeof data.claims.email === "string" ? data.claims.email : null;
  return { id: data.claims.sub, email, isAdmin: isPlatformAdmin(email) };
});

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** Platform admin only (PLATFORM_ADMIN_EMAILS). Everyone else gets a 404. */
export async function requireAdmin(): Promise<CurrentUser> {
  const user = await requireUser();
  if (!user.isAdmin) notFound();
  return user;
}

/** Businesses the signed-in user belongs to (row-level security applies). */
export const getMemberships = cache(async (): Promise<Membership[]> => {
  const user = await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tenant_members")
    .select("role, tenants(id, name)")
    .eq("user_id", user.id);
  if (error) throw new Error(`Could not load memberships: ${error.message}`);
  return (data ?? []).flatMap((row) =>
    row.tenants
      ? [
          {
            tenantId: row.tenants.id,
            tenantName: row.tenants.name,
            role: row.role,
          },
        ]
      : [],
  );
});
