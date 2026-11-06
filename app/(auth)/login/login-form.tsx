"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { sendLoginLink, verifyLoginCode, type LoginState } from "./actions";

const LINK_ERRORS: Record<string, string> = {
  link: "That login link didn't work. It may have expired or already been used. Request a new one below.",
};

const inputClass =
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50";

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

  if (state.status === "sent") return <CodeForm sent={state} />;

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
          className={inputClass}
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

function CodeForm({ sent }: { sent: Extract<LoginState, { status: "sent" }> }) {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    verifyLoginCode,
    sent,
  );
  const codeError = state.status === "sent" ? state.codeError : null;

  return (
    <div className="space-y-6">
      <div role="status" className="space-y-2">
        <p className="font-medium">Check your email.</p>
        <p className="text-sm text-muted-foreground">
          If {sent.email} has an account, we sent a login link. It expires in 1
          hour.
        </p>
      </div>
      <form action={formAction} className="space-y-3">
        <label htmlFor="code" className="text-sm font-medium">
          Or type the code from the email
        </label>
        <input
          id="code"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          className={`${inputClass} tracking-widest`}
        />
        {codeError && (
          <p role="alert" className="text-sm text-destructive">
            {codeError}
          </p>
        )}
        <Button
          type="submit"
          variant="outline"
          className="w-full"
          disabled={pending}
        >
          {pending ? "Checking…" : "Log in with code"}
        </Button>
      </form>
    </div>
  );
}
