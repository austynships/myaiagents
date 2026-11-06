import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { connection } from "next/server";
import type { Database } from "@/types/database";

/**
 * Supabase client for Server Components, Server Actions and Route Handlers,
 * acting as the signed-in user (row-level security applies).
 * Create a new one per request.
 */
export async function createClient() {
  // Always request-time. Supabase checks token expiry with Date.now(), which
  // Next.js forbids while prerendering (Partial Prefetching can prerender
  // with cookies available), so stop prerendering here.
  await connection();
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Server Components can't set cookies. proxy.ts refreshes the
            // session on every request, so this is safe to ignore.
          }
        },
      },
    },
  );
}
