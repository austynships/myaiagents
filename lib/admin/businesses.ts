import "server-only";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export type BusinessSummary = {
  id: string;
  name: string;
  createdAt: string;
  numbers: string[];
};

/** All businesses on the platform. Platform admin only. */
export async function listBusinesses(): Promise<BusinessSummary[]> {
  await requireAdmin(); // re-checked here, not just in the layout
  const db = createAdminClient();
  const { data, error } = await db
    .from("tenants")
    .select("id, name, created_at, phone_numbers(e164)")
    .eq("kind", "business")
    .order("created_at", { ascending: true });
  if (error) throw new Error(`Could not load businesses: ${error.message}`);
  return (data ?? []).map((t) => ({
    id: t.id,
    name: t.name,
    createdAt: t.created_at,
    numbers: t.phone_numbers.map((n) => n.e164),
  }));
}
