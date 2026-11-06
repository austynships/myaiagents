/**
 * Row-level security tests against the hosted DEV database.
 *
 * Every test runs inside a transaction that is rolled back, so nothing is left
 * behind. Skipped unless SUPABASE_DEV_DB_URL is set (in .env.local).
 * Never point this at production.
 *
 * Run: npm run test:db
 */
import postgres from "postgres";
import { afterAll, describe, expect, it } from "vitest";

try {
  process.loadEnvFile(".env.local");
} catch {
  // no .env.local: tests are skipped below
}

const url = process.env.SUPABASE_DEV_DB_URL;
const sql = url ? postgres(url, { max: 1, onnotice: () => {} }) : null;

type Tx = postgres.TransactionSql;

// Fixed test IDs (never real data; everything is rolled back).
const id = (n: number) =>
  `00000000-0000-4000-9000-${String(n).padStart(12, "0")}`;
const U = {
  ownerA: id(1),
  staffA: id(2),
  ownerB: id(3),
  agencyAdmin: id(4),
  newcomer: id(5),
};
const T = { a: id(11), b: id(12), agency: id(13), client: id(14) };
const AGENT = { a: id(21), b: id(22) };
const CONV = { a: id(31), b: id(32) };

/** Run `fn` in a transaction that is always rolled back. */
async function rolledBack(fn: (tx: Tx) => Promise<void>) {
  await sql!.begin(async (tx) => {
    await seedFixtures(tx);
    await fn(tx);
    await tx.rollback();
  });
}

/** Act as a signed-in user (role `authenticated`, auth.uid() = userId). */
async function asUser(tx: Tx, userId: string) {
  await tx`select set_config('request.jwt.claims', ${JSON.stringify({ sub: userId, role: "authenticated" })}, true)`;
  await tx`set local role authenticated`;
}

async function asAnon(tx: Tx) {
  await tx`select set_config('request.jwt.claims', ${JSON.stringify({ role: "anon" })}, true)`;
  await tx`set local role anon`;
}

/** Expect `fn` to fail with a Postgres error code, without aborting the outer transaction. */
async function expectPgError(
  tx: Tx,
  code: string,
  fn: (sp: Tx) => Promise<unknown>,
) {
  await expect(tx.savepoint(fn)).rejects.toMatchObject({ code });
}

async function seedFixtures(tx: Tx) {
  for (const [n, uid] of Object.entries(U)) {
    await tx`
      insert into auth.users (id, instance_id, aud, role, email)
      values (${uid}, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
              ${`rls-${n}@test.invalid`})`;
  }
  await tx`
    insert into public.tenants (id, kind, name, parent_tenant_id) values
      (${T.a}, 'business', 'Business A', null),
      (${T.b}, 'business', 'Business B', null),
      (${T.agency}, 'agency', 'Agency X', null),
      (${T.client}, 'business', 'Client C', ${T.agency})`;
  await tx`
    insert into public.tenant_members (tenant_id, user_id, role) values
      (${T.a}, ${U.ownerA}, 'owner'),
      (${T.a}, ${U.staffA}, 'staff'),
      (${T.b}, ${U.ownerB}, 'owner'),
      (${T.agency}, ${U.agencyAdmin}, 'agency_admin')`;
  await tx`
    insert into public.agents (id, tenant_id, template, name) values
      (${AGENT.a}, ${T.a}, 'missed_call_textback', 'Agent A'),
      (${AGENT.b}, ${T.b}, 'missed_call_textback', 'Agent B')`;
  await tx`
    insert into public.conversations (id, tenant_id, agent_id, channel, contact_phone) values
      (${CONV.a}, ${T.a}, ${AGENT.a}, 'sms', '+15555550001'),
      (${CONV.b}, ${T.b}, ${AGENT.b}, 'sms', '+15555550002')`;
  await tx`
    insert into public.messages (tenant_id, conversation_id, direction, sender, body) values
      (${T.a}, ${CONV.a}, 'inbound', 'contact', 'hello A'),
      (${T.b}, ${CONV.b}, 'inbound', 'contact', 'hello B')`;
}

afterAll(async () => {
  await sql?.end();
});

describe.skipIf(!sql)("row-level security", { timeout: 30_000 }, () => {
  it("owner sees only their own business's rows", async () => {
    await rolledBack(async (tx) => {
      await asUser(tx, U.ownerA);
      // Guard: we really are the restricted user, not the admin connection.
      const [who] = await tx`select current_user as role, auth.uid() as uid`;
      expect(who).toEqual({ role: "authenticated", uid: U.ownerA });
      const tenants = await tx`select id from public.tenants order by name`;
      expect(tenants.map((r) => r.id)).toEqual([T.a]);
      const agents = await tx`select id from public.agents`;
      expect(agents.map((r) => r.id)).toEqual([AGENT.a]);
      const convs = await tx`select id from public.conversations`;
      expect(convs.map((r) => r.id)).toEqual([CONV.a]);
      const msgs = await tx`select body from public.messages`;
      expect(msgs.map((r) => r.body)).toEqual(["hello A"]);
    });
  });

  it("owner cannot change or add to another business", async () => {
    await rolledBack(async (tx) => {
      await asUser(tx, U.ownerA);
      const upd =
        await tx`update public.tenants set name = 'hacked' where id = ${T.b}`;
      expect(upd.count).toBe(0);
      await expectPgError(
        tx,
        "42501",
        (sp) =>
          sp`insert into public.agents (tenant_id, template, name) values (${T.b}, 'custom', 'x')`,
      );
    });
  });

  it("owner can manage their own business", async () => {
    await rolledBack(async (tx) => {
      await asUser(tx, U.ownerA);
      const upd =
        await tx`update public.tenants set name = 'Business A2' where id = ${T.a}`;
      expect(upd.count).toBe(1);
      await tx`insert into public.knowledge_items (tenant_id, kind, content) values (${T.a}, 'faq', 'Open 7-6')`;
    });
  });

  it("staff can work the inbox but not change agent config", async () => {
    await rolledBack(async (tx) => {
      await asUser(tx, U.staffA);
      const convUpd =
        await tx`update public.conversations set state = 'human_takeover' where id = ${CONV.a}`;
      expect(convUpd.count).toBe(1);
      const agentUpd =
        await tx`update public.agents set name = 'x' where id = ${AGENT.a}`;
      expect(agentUpd.count).toBe(0);
      await expectPgError(
        tx,
        "42501",
        (sp) =>
          sp`insert into public.knowledge_items (tenant_id, kind, content) values (${T.a}, 'faq', 'x')`,
      );
    });
  });

  it("agency admin sees and manages client businesses only", async () => {
    await rolledBack(async (tx) => {
      await asUser(tx, U.agencyAdmin);
      const tenants = await tx`select id from public.tenants order by name`;
      expect(tenants.map((r) => r.id).sort()).toEqual(
        [T.agency, T.client].sort(),
      );
      await tx`insert into public.agents (tenant_id, template, name) values (${T.client}, 'missed_call_textback', 'C agent')`;
      await expectPgError(
        tx,
        "42501",
        (sp) =>
          sp`insert into public.agents (tenant_id, template, name) values (${T.a}, 'custom', 'x')`,
      );
    });
  });

  it("signed-out visitors cannot read anything", async () => {
    await rolledBack(async (tx) => {
      await asAnon(tx);
      await expectPgError(
        tx,
        "42501",
        (sp) => sp`select id from public.tenants`,
      );
      await expectPgError(
        tx,
        "42501",
        (sp) => sp`select id from public.messages`,
      );
    });
  });

  it("browser cannot write server-only tables", async () => {
    await rolledBack(async (tx) => {
      await asUser(tx, U.ownerA);
      await expectPgError(
        tx,
        "42501",
        (sp) =>
          sp`insert into public.messages (tenant_id, conversation_id, direction, sender, body)
           values (${T.a}, ${CONV.a}, 'outbound', 'ai', 'x')`,
      );
      await expectPgError(
        tx,
        "42501",
        (sp) =>
          sp`insert into public.usage_events (tenant_id, kind, quantity) values (${T.a}, 'sms_out_segment', 1)`,
      );
      await expectPgError(
        tx,
        "42501",
        (sp) =>
          sp`update public.phone_numbers set active = false where tenant_id = ${T.a}`,
      );
    });
  });

  it("owners can save draft versions but not publish them directly", async () => {
    await rolledBack(async (tx) => {
      await asUser(tx, U.ownerA);
      await tx`insert into public.agent_versions (tenant_id, agent_id, version, status, config)
               values (${T.a}, ${AGENT.a}, 1, 'draft', '{}')`;
      await expectPgError(
        tx,
        "42501",
        (sp) =>
          sp`insert into public.agent_versions (tenant_id, agent_id, version, status, config)
           values (${T.a}, ${AGENT.a}, 2, 'live', '{}')`,
      );
    });
  });

  it("create_business() makes the caller the owner", async () => {
    await rolledBack(async (tx) => {
      await asUser(tx, U.newcomer);
      const [{ create_business: newId }] =
        await tx`select public.create_business('New Co')`;
      const tenants = await tx`select id from public.tenants`;
      expect(tenants.map((r) => r.id)).toEqual([newId]);
      const [member] =
        await tx`select role from public.tenant_members where tenant_id = ${newId}`;
      expect(member.role).toBe("owner");
    });
  });

  it("rows cannot point at another business's rows", async () => {
    await rolledBack(async (tx) => {
      // as the service role (no RLS): the composite foreign keys still block it
      await expectPgError(
        tx,
        "23503",
        (sp) =>
          sp`insert into public.messages (tenant_id, conversation_id, direction, sender, body)
           values (${T.b}, ${CONV.a}, 'inbound', 'contact', 'x')`,
      );
    });
  });

  it("an agent has at most one live version", async () => {
    await rolledBack(async (tx) => {
      await tx`insert into public.agent_versions (tenant_id, agent_id, version, status, config)
               values (${T.a}, ${AGENT.a}, 1, 'live', '{}')`;
      await expectPgError(
        tx,
        "23505",
        (sp) =>
          sp`insert into public.agent_versions (tenant_id, agent_id, version, status, config)
           values (${T.a}, ${AGENT.a}, 2, 'live', '{}')`,
      );
    });
  });
});
