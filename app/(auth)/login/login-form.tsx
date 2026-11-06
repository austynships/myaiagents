"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { sendLoginLink, type LoginState } from "./actions";

const LINK_ERRORS: Record<string, string> = {
  link: "That login link didn't work. It may have expired, already been used, or been opened in a different browser. Request a new one below.",
};

export function LoginForm({
  next,
  error,
}: {
  next: string;
  error: string | null;
}) {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    sendLoginLink,
    {
      status: "idle",
    },
  );

  if (state.status === "sent") {
    return (
      <div role="status" className="space-y-2">
        <p className="font-medium">Check your email.</p>
        <p className="text-sm text-muted-foreground">
          If that address has an account, we sent a login link. Open it in this
          same browser. It expires in 1 hour.
        </p>
      </div>
    );
  }

  const message =
    state.status === "error"
      ? state.message
      : error
        ? (LINK_ERRORS[error] ?? null)
        : null;

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        />
      </div>
      {message && (
        <p role="alert" className="text-sm text-destructive">
          {message}
        </p>
      )}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Sending…" : "Email me a login link"}
      </Button>
    </form>
  );
}
