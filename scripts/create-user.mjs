// Create a login account (signup is off, so accounts are made here or from /admin).
//
//   node --env-file=.env.local      scripts/create-user.mjs someone@example.com   # dev
//   node --env-file=.env.prod.local scripts/create-user.mjs someone@example.com   # prod
//
// Safe to re-run: an existing account is left as is.
import { createClient } from "@supabase/supabase-js";

const email = process.argv[2]?.trim().toLowerCase();
if (!email || !email.includes("@")) {
  console.error(
    "Usage: node --env-file=<env file> scripts/create-user.mjs <email>",
  );
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;
if (!url || !secret) {
  console.error(
    "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY must be set (use --env-file).",
  );
  process.exit(1);
}

const db = createClient(url, secret, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const { data, error } = await db.auth.admin.createUser({
  email,
  email_confirm: true,
});

if (error) {
  if (error.code === "email_exists") {
    console.log(`Account already exists on ${new URL(url).hostname}.`);
    process.exit(0);
  }
  console.error(`Failed: ${error.code ?? ""} ${error.message}`);
  process.exit(1);
}
console.log(`Created account ${data.user.id} on ${new URL(url).hostname}.`);
