import Link from "next/link";
import { Suspense } from "react";
import { SignOutButton } from "@/components/sign-out-button";
import { getMemberships, requireUser } from "@/lib/auth";

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <Suspense
        fallback={<p className="p-6 text-sm text-muted-foreground">Loading…</p>}
      >
        <MemberGate>{children}</MemberGate>
      </Suspense>
    </div>
  );
}

/**
 * Signed-in members of at least one business see the dashboard.
 * Signed-in users with no business see a short explanation instead.
 */
async function MemberGate({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const memberships = await getMemberships();

  return (
    <>
      <header className="flex items-center justify-between border-b px-6 py-3">
        <span className="font-semibold">
          {memberships[0]?.tenantName ?? "Dashboard"}
        </span>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          {user.isAdmin && (
            <Link href="/admin" className="underline underline-offset-4">
              Admin
            </Link>
          )}
          <span>{user.email}</span>
          <SignOutButton />
        </div>
      </header>
      <main className="flex-1 p-6">
        {memberships.length > 0 ? (
          children
        ) : (
          <div className="max-w-md space-y-2">
            <h1 className="text-xl font-semibold">No business linked yet</h1>
            <p className="text-sm text-muted-foreground">
              This account isn&apos;t connected to a business. If you expected
              to see your inbox, contact the person who invited you.
            </p>
          </div>
        )}
      </main>
    </>
  );
}
