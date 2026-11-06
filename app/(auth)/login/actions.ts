"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { isPlatformAdmin, postLoginPath, safeNextPath } from "@/lib/auth-paths";
import { createClient } from "@/lib/supabase/server";

export type LoginState =
  | { status: "idle" }
  | { status: "sent"; email: string; next: string; codeError?: string }
  | { status: "error"; message: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Supabase error codes meaning "no account with this email". */
const UNKNOWN_ACCOUNT_CODES = new Set(["otp_disabled", "user_not_found"]);

export async function sendLoginLink(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return { status: "error", message: "Enter a valid email address." };
  }

  const origin = (await headers()).get("origin");
  if (!origin) {
    return {
      status: "error",
      message: "Something went wrong. Refresh the page and try again.",
    };
  }

  // Always include `next` (even empty) so the URL already has a "?": the email
  // template appends "&token_hash=...". See supabase/templates/magic_link.html.
  const next = safeNextPath(String(formData.get("next") ?? ""), "");
  const redirectTo = new URL("/auth/confirm", origin);
  redirectTo.searchParams.set("next", next);

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    // Invite-only: never create an account from the login form.
    options: {
      shouldCreateUser: false,
      emailRedirectTo: redirectTo.toString(),
    },
  });

  // No account for this email (signup is off): show the same "check your
  // email" screen as a real send, so the form can't be used to probe accounts.
  if (!error || (error.code && UNKNOWN_ACCOUNT_CODES.has(error.code))) {
    return { status: "sent", email, next };
  }

  // Anything else is a real failure: log it (without the email) and say so.
  console.error("[login] signInWithOtp failed", {
    status: error.status,
    code: error.code,
    message: error.message,
  });
  if (error.status === 429) {
    return {
      status: "error",
      message: "Too many attempts. Wait a minute and try again.",
    };
  }
  return {
    status: "error",
    message:
      "We couldn't send a login link right now. Try again in a few minutes.",
  };
}

/** Backup for the link: type the code from the same email. */
export async function verifyLoginCode(
  prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  if (prev.status !== "sent") return prev;
  const token = String(formData.get("code") ?? "").replace(/\D/g, "");
  if (token.length < 6 || token.length > 10) {
    return { ...prev, codeError: "Enter the code from the email." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    email: prev.email,
    token,
    type: "email",
  });
  if (error) {
    console.error("[login] verifyOtp (code) failed", { code: error.code });
    return {
      ...prev,
      codeError:
        "That code didn't work. It may have expired; request a new email.",
    };
  }

  // `prev` comes back from the browser, so decide from the verified session.
  const { data } = await supabase.auth.getClaims();
  const email =
    typeof data?.claims?.email === "string" ? data.claims.email : null;
  redirect(postLoginPath(prev.next, isPlatformAdmin(email)));
}
