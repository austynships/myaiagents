import type { Metadata } from "next";
import { Suspense } from "react";
import { safeNextPath } from "@/lib/auth-paths";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-6 py-16">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Log in</h1>
        <p className="text-sm text-muted-foreground">
          We&apos;ll email you a link. No password needed.
        </p>
      </div>
      {/* searchParams are request-time data, so they stream in behind Suspense */}
      <Suspense fallback={<LoginForm next="" error={null} />}>
        <LoginFormWithParams searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function LoginFormWithParams({
  searchParams,
}: {
  searchParams: PageProps<"/login">["searchParams"];
}) {
  const params = await searchParams;
  const first = (v: string | string[] | undefined) =>
    (Array.isArray(v) ? v[0] : v) ?? null;
  return (
    <LoginForm
      next={safeNextPath(first(params.next), "")}
      error={first(params.error)}
    />
  );
}
