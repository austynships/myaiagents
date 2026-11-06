import type { Metadata } from "next";
import { getMemberships } from "@/lib/auth";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const memberships = await getMemberships(); // re-checks the session itself

  return (
    <div className="max-w-2xl space-y-2">
      <h1 className="text-xl font-semibold">This week</h1>
      <p className="text-sm text-muted-foreground">
        Missed calls, replies and leads for{" "}
        {memberships.map((m) => m.tenantName).join(", ")} will show here once
        text-back is live.
      </p>
    </div>
  );
}
