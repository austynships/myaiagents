"use server";

import { headers } from "next/headers";
import { safeNextPath } from "@/lib/auth-paths";
import { createClient } from "@/lib/supabase/server";

export type LoginState =
  | { status: "idle" }
  | { status: "sent" }
  | { status: "error"; message: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

  const redirectTo = new URL("/auth/confirm", origin);
  const next = safeNextPath(String(formData.get("next") ?? ""), "");
  if (next) redirectTo.searchParams.set("next", next);

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    // Invite-only: never create an account from the login form.
    options: {
      shouldCreateUser: false,
      emailRedirectTo: redirectTo.toString(),
    },
  });

  if (!error) return { status: "sent" };

  // No account for this email (signup is off). Show the same "check your
  // email" message as a real send, so the form can't be used to probe accounts.
  if (error.code && UNKNOWN_ACCOUNT_CODES.has(error.code)) {
    return { status: "sent" };
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

/** Supabase error codes meaning "no account with this email". */
const UNKNOWN_ACCOUNT_CODES = new Set(["otp_disabled", "user_not_found"]);
