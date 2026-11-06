import type { Metadata } from "next";
import { Suspense } from "react";
import { NoBusiness } from "@/components/no-business";
import { getMemberships } from "@/lib/auth";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  return (
    <Suspense
      fallback={<p className="text-sm text-muted-foreground">Loading…</p>}
    >
      <ThisWeek />
    </Suspense>
  );
}

async function ThisWeek() {
  const memberships = await getMemberships(); // checks the session itself
  if (memberships.length === 0) return <NoBusiness />;

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
