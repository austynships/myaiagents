/** Pure helpers for auth routing. No server imports, so they're easy to test. */

const PROTECTED_PREFIXES = [
  "/admin",
  "/dashboard",
  "/inbox",
  "/leads",
  "/settings",
];

/** Pages that need a signed-in user. */
export function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

/**
 * Only allow redirects to paths on this site (blocks open redirects such as
 * `//evil.com` or `https://evil.com`). Falls back to `fallback`.
 */
export function safeNextPath(
  next: string | null | undefined,
  fallback = "/dashboard",
): string {
  if (
    !next ||
    !next.startsWith("/") ||
    next.startsWith("//") ||
    next.startsWith("/\\")
  ) {
    return fallback;
  }
  return next;
}

/** Comma-separated list from PLATFORM_ADMIN_EMAILS, case-insensitive. */
export function isPlatformAdmin(
  email: string | null | undefined,
  adminList: string | undefined = process.env.PLATFORM_ADMIN_EMAILS,
): boolean {
  if (!email || !adminList) return false;
  const admins = adminList
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return admins.includes(email.trim().toLowerCase());
}

/**
 * The only email-link types our confirm page accepts. Supabase's older
 * "magiclink" type is the same thing as "email".
 */
export function parseEmailLinkType(
  value: string | null | undefined,
): "email" | "invite" | null {
  if (value === "email" || value === "magiclink") return "email";
  if (value === "invite") return "invite";
  return null;
}

/** Where to send someone right after they log in. */
export function postLoginPath(
  next: string | null | undefined,
  isAdmin: boolean,
): string {
  return safeNextPath(next, isAdmin ? "/admin" : "/dashboard");
}
