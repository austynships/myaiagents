import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    // Everything except static files, images and Twilio webhooks
    // (webhooks are verified by Twilio signature, not by user session).
    "/((?!_next/static|_next/image|favicon.ico|api/twilio|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
