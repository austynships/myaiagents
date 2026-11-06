import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { isPlatformAdmin, safeNextPath } from "@/lib/auth-paths";
import { createClient } from "@/lib/supabase/server";

/**
 * Where login and invite email links land. Supports both:
 * - `?code=` (Supabase's standard email, PKCE: must open in the same browser)
 * - `?token_hash=&type=` (our custom templates, once custom SMTP is set up)
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  const supabase = await createClient();
  let ok = false;
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    ok = !error;
    if (error)
      console.error("[auth/confirm] code exchange failed", {
        code: error.code,
      });
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });
    ok = !error;
    if (error)
      console.error("[auth/confirm] verifyOtp failed", { code: error.code });
  }

  if (!ok) {
    return NextResponse.redirect(new URL("/login?error=link", origin));
  }

  const { data } = await supabase.auth.getClaims();
  const email =
    typeof data?.claims?.email === "string" ? data.claims.email : null;
  const fallback = isPlatformAdmin(email) ? "/admin" : "/dashboard";
  return NextResponse.redirect(
    new URL(safeNextPath(searchParams.get("next"), fallback), origin),
  );
}
