import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { parseEmailLinkType, safeNextPath } from "@/lib/auth-paths";
import { confirmLogin } from "./actions";

export const metadata: Metadata = {
  title: "Log in",
  robots: { index: false, follow: false },
};

export default function ConfirmPage({
  searchParams,
}: PageProps<"/auth/confirm">) {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-6 py-16">
      <Suspense
        fallback={<p className="text-sm text-muted-foreground">Loading…</p>}
      >
        <Confirm searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function Confirm({
  searchParams,
}: {
  searchParams: PageProps<"/auth/confirm">["searchParams"];
}) {
  const params = await searchParams;
  const first = (v: string | string[] | undefined) =>
    (Array.isArray(v) ? v[0] : v) ?? "";
  const tokenHash = first(params.token_hash);
  const type = parseEmailLinkType(first(params.type));
  const code = first(params.code);
  const next = safeNextPath(first(params.next), "");
  const isInvite = type === "invite";

  if (!(tokenHash && type) && !code) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">
          Link not valid
        </h1>
        <p className="text-sm text-muted-foreground">
          This login link is missing information or has expired. Request a new
          one.
        </p>
        <Link href="/login" className={buttonVariants({ variant: "outline" })}>
          Back to log in
        </Link>
      </div>
    );
  }

  return (
    <form action={confirmLogin} className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">
        {isInvite ? "Accept your invite" : "Finish logging in"}
      </h1>
      <p className="text-sm text-muted-foreground">
        Press the button to{" "}
        {isInvite ? "accept the invite and log in" : "log in"}.
      </p>
      <input type="hidden" name="token_hash" value={tokenHash} />
      <input type="hidden" name="type" value={type ?? ""} />
      <input type="hidden" name="code" value={code} />
      <input type="hidden" name="next" value={next} />
      <Button type="submit" className="w-full">
        {isInvite ? "Accept and log in" : "Log in"}
      </Button>
    </form>
  );
}
