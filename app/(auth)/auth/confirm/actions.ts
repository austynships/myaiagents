"use server";

import { redirect } from "next/navigation";
import {
  isPlatformAdmin,
  parseEmailLinkType,
  postLoginPath,
} from "@/lib/auth-paths";
import { createClient } from "@/lib/supabase/server";

/**
 * Runs only when the person presses "Log in" (a POST). Email link scanners
 * (e.g. Outlook Safe Links) just load the page, so they can't use up the link.
 */
export async function confirmLogin(formData: FormData) {
  const tokenHash = String(formData.get("token_hash") ?? "");
  const type = parseEmailLinkType(String(formData.get("type") ?? ""));
  const code = String(formData.get("code") ?? "");
  const next = String(formData.get("next") ?? "");

  const supabase = await createClient();
  let failed = true;
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });
    failed = Boolean(error);
    if (error)
      console.error("[auth/confirm] verifyOtp failed", { code: error.code });
  } else if (code) {
    // Supabase's standard email (before custom templates are on): PKCE code,
    // works only in the browser that asked for the link.
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    failed = Boolean(error);
    if (error)
      console.error("[auth/confirm] code exchange failed", {
        code: error.code,
      });
  }

  if (failed) redirect("/login?error=link");

  const { data } = await supabase.auth.getClaims();
  const email =
    typeof data?.claims?.email === "string" ? data.claims.email : null;
  redirect(postLoginPath(next, isPlatformAdmin(email)));
}
