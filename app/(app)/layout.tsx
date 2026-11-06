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
      <header className="flex min-h-14 items-center justify-between border-b px-6 py-3">
        <Suspense fallback={<span className="font-semibold">Dashboard</span>}>
          <AccountBar />
        </Suspense>
      </header>
      {/* Pages check access themselves (lib/auth.ts) and stream in their own data. */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}

async function AccountBar() {
  const user = await requireUser();
  const memberships = await getMemberships();

  return (
    <>
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
    </>
  );
}
