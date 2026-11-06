# AI Agent Builder — Build Plan (Phase 0: Missed-Call Text-Back)

Source: `PRD.MD` (Nov 6, 2026) + your answers (Nov 6, 2026). Status: **Phase 0 scope confirmed. Starting fresh — there is no prior codebase.**
Anything still marked **[ASSUMPTION]** is a minor detail; the remaining open questions are in section 7.

---

## 1. Product in 5 bullets

1. **What it is:** an AI agent builder for local service businesses (plumbers, HVAC, med spas, salons, auto shops, restaurants in Macomb County / metro Detroit). Owner pastes a website, picks a template, forwards their phone — live agent in under 10 minutes.
2. **What we sell:** one agent at a time ("$49/mo missed-call agent", "$149/mo receptionist"), but every agent is a *template* on one shared engine (channels + knowledge + tools + flow + guardrails + handoff). The engine is the moat; templates are the storefront.
3. **Launch templates:** Missed-Call Text-Back (text the caller within 10 s, two-way AI SMS, human takeover) and AI Receptionist (24/7 voice, FAQs, qualify, book on a calendar, warm-transfer emergencies). More templates (reminders, reviews, web chat, speed-to-lead…) reuse the same blocks.
4. **Proof of value:** the dashboard leads with money — calls answered, leads captured, jobs booked, estimated revenue — plus an inbox of every call/text with transcript, summary and outcome tag, and instant owner alerts.
5. **How it ships:** cheapest agent first (text-back), voice once text-back is paying, builder/agency/white-label only after 10 paying customers. Stack: Next.js + Supabase + Twilio + Claude on Vercel, managed voice layer at MVP. Compliance (A2P 10DLC, TCPA/STOP, recording + AI disclosure) is in the MVP, not bolted on.

---

## 2. Folder structure

Latest stable Next.js (16.4.5 as of Nov 6, 2026 — pin the exact version at scaffold time), App Router, TypeScript, Tailwind + shadcn/ui, Supabase CLI migrations. Note: Next.js 16 renamed `middleware.ts` to `proxy.ts`. Designed so the shared engine (`lib/engine`) is separate from any one template (`lib/templates/*`) — adding the Receptionist later means adding a template folder and a voice channel, not a new app.

```
my-ai-agents/
├─ app/
│  ├─ (marketing)/                 # public pages
│  │  ├─ page.tsx                  # landing page
│  │  └─ forwarding/page.tsx       # carrier forwarding guide you send to owners (Verizon, AT&T, T-Mobile)
│  ├─ (auth)/
│  │  ├─ login/page.tsx
│  │  ├─ signup/page.tsx
│  │  └─ auth/callback/route.ts    # Supabase auth code exchange
│  ├─ (app)/                       # signed-in dashboard (layout checks session)
│  │  ├─ layout.tsx
│  │  ├─ dashboard/page.tsx        # "This week: X calls, Y leads, $Z"
│  │  ├─ inbox/page.tsx            # conversation list
│  │  ├─ inbox/[conversationId]/page.tsx   # thread + takeover + reply box
│  │  ├─ leads/page.tsx
│  │  └─ settings/page.tsx         # owner: alert phone, notification prefs
│  ├─ admin/                       # YOU only (platform admin) — Phase 0 concierge setup
│  │  ├─ layout.tsx                # checks PLATFORM_ADMIN_EMAILS
│  │  ├─ page.tsx                  # all businesses: status, A2P status, reply rate, cost
│  │  ├─ businesses/new/page.tsx   # name, hours, services, FAQs, tone, alert phone
│  │  └─ businesses/[tenantId]/page.tsx  # edit all of the above, assign number, invite owner, test
│  └─ api/
│     ├─ twilio/
│     │  ├─ voice/route.ts         # inbound (forwarded) call → TwiML + trigger text-back
│     │  ├─ voice-status/route.ts  # call status callbacks
│     │  ├─ sms/route.ts           # inbound SMS (customer or owner)
│     │  └─ sms-status/route.ts    # delivery receipts → message status
│     └─ cron/
│        └─ close-stale/route.ts   # close idle conversations (Vercel Cron)
├─ lib/
│  ├─ supabase/
│  │  ├─ client.ts                 # browser client
│  │  ├─ server.ts                 # server components / actions (user session)
│  │  ├─ admin.ts                  # service-role client — webhooks only, never in client code
│  │  └─ middleware.ts             # session refresh helper
│  ├─ twilio/
│  │  ├─ client.ts
│  │  ├─ verify-signature.ts       # X-Twilio-Signature check on every webhook
│  │  ├─ twiml.ts
│  │  └─ send-sms.ts               # opt-out check + usage logging + idempotency
│  ├─ ai/
│  │  ├─ anthropic.ts              # Claude client, model routing (fast vs smart)
│  │  └─ usage.ts                  # token → usage_events
│  ├─ engine/                      # THE shared runtime (template-agnostic)
│  │  ├─ load-agent.ts             # phone number → tenant → agent → live version config
│  │  ├─ run-turn.ts               # build context, call Claude, execute tools, return reply
│  │  ├─ guardrails.ts             # price ranges, no ETA promises, blocklist, length caps
│  │  ├─ tools/                    # capture_lead, request_human, mark_spam, (later) book_slot
│  │  └─ fallback.ts               # canned reply + owner alert when AI fails
│  ├─ templates/
│  │  └─ missed-call-textback/
│  │     ├─ default-config.ts      # first-text template, required fields, guardrails
│  │     └─ system-prompt.ts
│  ├─ alerts/                      # owner SMS alerts (email later)
│  └─ compliance/
│     └─ opt-out.ts                # STOP/START/HELP handling
├─ components/
│  ├─ ui/                          # shadcn primitives
│  ├─ inbox/
│  └─ dashboard/
├─ supabase/
│  ├─ config.toml
│  ├─ migrations/
│  │  └─ 20261106120000_core.sql   # schema in section 3
│  ├─ seed.sql                     # one test tenant + agent + number for local dev
├─ types/
│  └─ database.ts                  # generated: supabase gen types typescript
├─ tests/                          # vitest: engine, guardrails, webhook handlers
│  └─ db/rls.test.ts               # RLS tests against the dev DB (rolled back)
├─ docs/
│  └─ build-plan.md
├─ proxy.ts                        # (Next 16 name for middleware) Supabase session refresh + protect (app)/admin routes
├─ .env.example
└─ vercel.json                     # cron schedule
```

**Not in Phase 0** (folders added when their phase starts): `app/api/voice-provider/*` (Vapi/Retell tool backend), `lib/integrations/calendar`, `lib/crawl`, `lib/billing` (Stripe), owner self-serve agent editor, `app/(agency)/*`, background-job runner (Inngest/Trigger.dev).

---

## 3. Supabase schema (`supabase/migrations/20261106120000_core.sql`)

> **Applied Nov 6, 2026** to `myaiagents-dev` and `myaiagents-prod`. The migration file is the source of truth; the SQL below is the original design and differs in small ways (explicit table grants, split write policies, pgvector in the `extensions` schema).

**Design notes**
- Every row carries `tenant_id`. RLS checks membership through two helper functions in a non-exposed `private` schema.
- Tenancy: one `tenants` table with `kind = agency | business` and `parent_tenant_id`. An agency admin automatically sees its client businesses. (Agency UI is P1, but the data model supports it now so we don't migrate later.)
- **Two tables added beyond your list**, because RLS and compliance need them: `tenant_members` (who belongs to which tenant — RLS is impossible without it) and `sms_opt_outs` (TCPA: honor STOP and keep a record).
- `bookings`, `tool_connections`, `test_cases` from the PRD's data model are left for Phase 1.
- Twilio webhooks run with the **service-role key**, which bypasses RLS. RLS protects everything the dashboard (browser) touches.
- Composite foreign keys `(id, tenant_id)` stop a child row from ever pointing at another tenant's parent row.
- Roles: `agency_admin` and `owner` can change config; `staff` is inbox-only (read + reply), per the PRD's role list.

```sql
-- =========================================================
-- 0001_core.sql — core multi-tenant data model
-- =========================================================
create extension if not exists pgcrypto;
create extension if not exists vector;      -- pgvector for knowledge search (used from Phase 1)

create schema if not exists private;        -- not exposed through the API

-- ---------- enums ----------
create type tenant_kind        as enum ('agency', 'business');
create type member_role        as enum ('agency_admin', 'owner', 'staff');
create type agent_template     as enum ('missed_call_textback', 'receptionist', 'custom');
create type agent_status       as enum ('draft', 'active', 'paused', 'archived');
create type version_status     as enum ('draft', 'live', 'archived');
create type knowledge_kind     as enum ('faq', 'service', 'web_page', 'document', 'pricing', 'hours', 'service_area', 'correction', 'other');
create type number_source      as enum ('provisioned', 'ported');
create type a2p_status         as enum ('not_started', 'pending', 'approved', 'rejected');
create type channel_kind       as enum ('voice', 'sms', 'web_chat');
create type conversation_state as enum ('ai_active', 'human_takeover', 'closed');
create type outcome_tag        as enum ('booked', 'lead', 'faq', 'spam', 'transferred', 'no_response', 'other');
create type msg_direction      as enum ('inbound', 'outbound');
create type msg_sender         as enum ('contact', 'ai', 'human', 'system');
create type lead_status        as enum ('new', 'contacted', 'booked', 'won', 'lost');
create type usage_kind         as enum ('sms_out_segment', 'sms_in_segment', 'voice_minute', 'llm_input_tokens', 'llm_output_tokens', 'phone_number_month');

-- ---------- updated_at helper ----------
create or replace function private.touch_updated_at() returns trigger
language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

-- =========================================================
-- tenants & membership
-- =========================================================
create table public.tenants (
  id                  uuid primary key default gen_random_uuid(),
  kind                tenant_kind not null default 'business',
  parent_tenant_id    uuid references public.tenants(id) on delete restrict,
  name                text not null,
  timezone            text not null default 'America/Detroit',
  owner_alert_phone   text,                       -- E.164, where lead/escalation texts go
  owner_alert_email   text,
  avg_job_value_cents integer check (avg_job_value_cents >= 0),
  business_hours      jsonb not null default '{}'::jsonb,
  settings            jsonb not null default '{}'::jsonb,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  constraint agencies_have_no_parent check (kind = 'business' or parent_tenant_id is null)
);
create index on public.tenants (parent_tenant_id);
create trigger tenants_touch before update on public.tenants
  for each row execute function private.touch_updated_at();

create table public.tenant_members (
  tenant_id  uuid not null references public.tenants(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  role       member_role not null default 'owner',
  created_at timestamptz not null default now(),
  primary key (tenant_id, user_id)
);
create index on public.tenant_members (user_id);

-- ---------- RLS helpers (security definer → no RLS recursion) ----------
-- Member of the tenant itself, or of its parent agency.
create or replace function private.can_access(t uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1
    from public.tenant_members m
    join public.tenants tt on tt.id = t
    where m.user_id = (select auth.uid())
      and (m.tenant_id = tt.id or m.tenant_id = tt.parent_tenant_id)
  );
$$;

-- Can change config: owner of the business, or agency_admin of it / its parent.
create or replace function private.can_manage(t uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1
    from public.tenant_members m
    join public.tenants tt on tt.id = t
    where m.user_id = (select auth.uid())
      and (
        (m.tenant_id = tt.id and m.role in ('owner', 'agency_admin'))
        or (m.tenant_id = tt.parent_tenant_id and m.role = 'agency_admin')
      )
  );
$$;

grant usage on schema private to authenticated;
grant execute on function private.can_access(uuid), private.can_manage(uuid) to authenticated;

-- Signup: create a business and make the caller its owner (tenants has no insert policy).
create or replace function public.create_business(p_name text, p_timezone text default 'America/Detroit')
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_id uuid;
begin
  if (select auth.uid()) is null then raise exception 'not authenticated'; end if;
  insert into public.tenants (kind, name, timezone) values ('business', p_name, p_timezone)
    returning id into v_id;
  insert into public.tenant_members (tenant_id, user_id, role) values (v_id, (select auth.uid()), 'owner');
  return v_id;
end $$;
revoke execute on function public.create_business(text, text) from public, anon;
grant execute on function public.create_business(text, text) to authenticated;

-- =========================================================
-- agents & versions
-- =========================================================
create table public.agents (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references public.tenants(id) on delete cascade,
  template        agent_template not null,
  name            text not null,
  status          agent_status not null default 'draft',
  live_version_id uuid,                            -- FK added after agent_versions exists
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (id, tenant_id)
);
create index on public.agents (tenant_id);
create trigger agents_touch before update on public.agents
  for each row execute function private.touch_updated_at();

create table public.agent_versions (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null,
  agent_id    uuid not null,
  version     integer not null,
  status      version_status not null default 'draft',
  -- Everything the runtime needs: voice greeting, first text, tone, prompt, required fields,
  -- guardrails (price ranges, blocklist, max length), handoff rules, tool settings.
  config      jsonb not null,
  notes       text,
  created_by  uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now(),
  published_at timestamptz,
  unique (agent_id, version),
  unique (id, tenant_id),
  unique (id, agent_id),                           -- target for agents.live_version_id FK
  foreign key (agent_id, tenant_id) references public.agents(id, tenant_id) on delete cascade
);
create unique index one_live_version_per_agent on public.agent_versions (agent_id) where status = 'live';

alter table public.agents
  add constraint agents_live_version_fk
  foreign key (live_version_id, id) references public.agent_versions(id, agent_id)
  deferrable initially deferred;          -- live version must belong to this agent

-- =========================================================
-- knowledge
-- =========================================================
create table public.knowledge_items (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references public.tenants(id) on delete cascade,
  agent_id    uuid,                                -- null = shared by all the tenant's agents
  kind        knowledge_kind not null,
  title       text,
  content     text not null,
  source_url  text,
  enabled     boolean not null default true,
  embedding   vector(1024),                        -- [ASSUMPTION] dims depend on embedding model, filled in Phase 1
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  foreign key (agent_id, tenant_id) references public.agents(id, tenant_id) on delete cascade
);
create index on public.knowledge_items (tenant_id, agent_id);
create trigger knowledge_touch before update on public.knowledge_items
  for each row execute function private.touch_updated_at();

-- =========================================================
-- phone numbers
-- =========================================================
create table public.phone_numbers (
  id                   uuid primary key default gen_random_uuid(),
  tenant_id            uuid not null references public.tenants(id) on delete cascade,
  agent_id             uuid,                       -- which agent answers this number
  e164                 text not null unique,       -- routing key for every Twilio webhook
  twilio_sid           text unique,
  source               number_source not null default 'provisioned',
  forwarded_from_e164  text,                       -- the owner's real business line
  forwarding_verified_at timestamptz,              -- set when the test call succeeds
  messaging_service_sid text,
  a2p_status           a2p_status not null default 'not_started',
  a2p_notes            text,
  active               boolean not null default true,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  unique (id, tenant_id),
  foreign key (agent_id, tenant_id) references public.agents(id, tenant_id) on delete set null (agent_id)
);
create index on public.phone_numbers (tenant_id);
create trigger phone_numbers_touch before update on public.phone_numbers
  for each row execute function private.touch_updated_at();

-- =========================================================
-- conversations & messages
-- =========================================================
create table public.conversations (
  id               uuid primary key default gen_random_uuid(),
  tenant_id        uuid not null references public.tenants(id) on delete cascade,
  agent_id         uuid,
  agent_version_id uuid references public.agent_versions(id) on delete set null,
  phone_number_id  uuid,
  channel          channel_kind not null,
  contact_phone    text not null,                  -- E.164 of the caller/texter
  contact_name     text,
  state            conversation_state not null default 'ai_active',
  outcome          outcome_tag,
  summary          text,
  trigger_call_sid text,                           -- the missed call that started it
  taken_over_by    uuid references auth.users(id) on delete set null,
  started_at       timestamptz not null default now(),
  last_message_at  timestamptz not null default now(),
  closed_at        timestamptz,
  unique (id, tenant_id),
  foreign key (agent_id, tenant_id)        references public.agents(id, tenant_id)        on delete set null (agent_id),
  foreign key (phone_number_id, tenant_id) references public.phone_numbers(id, tenant_id) on delete set null (phone_number_id)
);
-- one open thread per (our number, caller): repeat calls/texts join the same thread
create unique index one_open_conversation
  on public.conversations (phone_number_id, contact_phone) where state <> 'closed';
create index on public.conversations (tenant_id, last_message_at desc);

create table public.messages (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null,
  conversation_id uuid not null,
  direction       msg_direction not null,
  sender          msg_sender not null,
  sent_by_user    uuid references auth.users(id) on delete set null,   -- when sender = 'human'
  body            text not null,
  twilio_sid      text unique,                     -- idempotency: Twilio retries webhooks
  delivery_status text,                            -- queued/sent/delivered/failed/undelivered
  error_code      text,
  segments        smallint,
  created_at      timestamptz not null default now(),
  foreign key (conversation_id, tenant_id) references public.conversations(id, tenant_id) on delete cascade
);
create index on public.messages (conversation_id, created_at);
create index on public.messages (tenant_id, created_at desc);

-- =========================================================
-- leads
-- =========================================================
create table public.leads (
  id                    uuid primary key default gen_random_uuid(),
  tenant_id             uuid not null references public.tenants(id) on delete cascade,
  conversation_id       uuid unique,
  name                  text,
  phone                 text,
  email                 text,
  address               text,
  service_needed        text,
  urgency               text,                      -- e.g. emergency / this_week / flexible
  status                lead_status not null default 'new',
  estimated_value_cents integer,
  fields                jsonb not null default '{}'::jsonb,   -- any extra configured fields
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  foreign key (conversation_id, tenant_id) references public.conversations(id, tenant_id) on delete set null (conversation_id)
);
create index on public.leads (tenant_id, created_at desc);
create trigger leads_touch before update on public.leads
  for each row execute function private.touch_updated_at();

-- =========================================================
-- usage (append-only; written by the server only)
-- =========================================================
create table public.usage_events (
  id              bigint generated always as identity primary key,
  tenant_id       uuid not null references public.tenants(id) on delete cascade,
  agent_id        uuid references public.agents(id) on delete set null,
  conversation_id uuid references public.conversations(id) on delete set null,
  kind            usage_kind not null,
  quantity        numeric not null check (quantity >= 0),
  unit_cost_usd   numeric(12, 6),                  -- our cost, for margin tracking
  model           text,                            -- for llm_* kinds
  metadata        jsonb not null default '{}'::jsonb,
  occurred_at     timestamptz not null default now()
);
create index on public.usage_events (tenant_id, occurred_at);

-- =========================================================
-- SMS opt-outs (added: TCPA / carrier STOP handling)
-- =========================================================
create table public.sms_opt_outs (
  tenant_id      uuid not null references public.tenants(id) on delete cascade,
  contact_phone  text not null,
  opted_out_at   timestamptz not null default now(),
  opted_in_at    timestamptz,                      -- set on START; null = currently opted out
  keyword        text,
  primary key (tenant_id, contact_phone)
);

-- =========================================================
-- Row-level security
-- =========================================================
alter table public.tenants         enable row level security;
alter table public.tenant_members  enable row level security;
alter table public.agents          enable row level security;
alter table public.agent_versions  enable row level security;
alter table public.knowledge_items enable row level security;
alter table public.phone_numbers   enable row level security;
alter table public.conversations   enable row level security;
alter table public.messages        enable row level security;
alter table public.leads           enable row level security;
alter table public.usage_events    enable row level security;
alter table public.sms_opt_outs    enable row level security;

-- tenants: read if member; update if manager; insert only via create_business()
create policy tenants_select on public.tenants for select to authenticated
  using (private.can_access(id));
create policy tenants_update on public.tenants for update to authenticated
  using (private.can_manage(id)) with check (private.can_manage(id));

-- tenant_members: see your teammates; managers add/remove
create policy members_select on public.tenant_members for select to authenticated
  using (private.can_access(tenant_id));
create policy members_write on public.tenant_members for all to authenticated
  using (private.can_manage(tenant_id)) with check (private.can_manage(tenant_id));

-- config tables: everyone in the tenant reads, managers write
create policy agents_select on public.agents for select to authenticated
  using (private.can_access(tenant_id));
create policy agents_write on public.agents for all to authenticated
  using (private.can_manage(tenant_id)) with check (private.can_manage(tenant_id));

create policy versions_select on public.agent_versions for select to authenticated
  using (private.can_access(tenant_id));
create policy versions_insert on public.agent_versions for insert to authenticated
  with check (private.can_manage(tenant_id) and status = 'draft');
create policy versions_update_draft on public.agent_versions for update to authenticated
  using (private.can_manage(tenant_id) and status = 'draft')
  with check (private.can_manage(tenant_id) and status = 'draft');
-- publishing (draft → live) goes through a server action using the service role

create policy knowledge_select on public.knowledge_items for select to authenticated
  using (private.can_access(tenant_id));
create policy knowledge_write on public.knowledge_items for all to authenticated
  using (private.can_manage(tenant_id)) with check (private.can_manage(tenant_id));

-- phone numbers: read-only from the browser; buying/assigning happens server-side
create policy numbers_select on public.phone_numbers for select to authenticated
  using (private.can_access(tenant_id));

-- inbox tables: any member (incl. staff) reads and updates; no deletes from the browser
create policy conv_select on public.conversations for select to authenticated
  using (private.can_access(tenant_id));
create policy conv_update on public.conversations for update to authenticated
  using (private.can_access(tenant_id)) with check (private.can_access(tenant_id));

create policy msg_select on public.messages for select to authenticated
  using (private.can_access(tenant_id));
-- outbound human replies are inserted by a server action after Twilio accepts them

create policy leads_select on public.leads for select to authenticated
  using (private.can_access(tenant_id));
create policy leads_update on public.leads for update to authenticated
  using (private.can_access(tenant_id)) with check (private.can_access(tenant_id));

-- usage + opt-outs: read-only for members
create policy usage_select on public.usage_events for select to authenticated
  using (private.can_access(tenant_id));
create policy optout_select on public.sms_opt_outs for select to authenticated
  using (private.can_access(tenant_id));

-- Live inbox updates in the dashboard (Realtime respects RLS)
alter publication supabase_realtime add table public.conversations, public.messages;
```

**RLS tests (`tests/db/rls.test.ts`, run with `npm run test:db`):** 11 Vitest tests against the dev database, each inside a rolled-back transaction: owner isolation, staff limits, agency admin scope, anon access, server-only tables, draft-only versions, `create_business()`, cross-tenant foreign keys, one live version per agent. No Docker needed.

---

## 4. Roadmap

Each gate is go/no-go: don't start the next phase's features until its gate is met.

| Phase | When | What ships | Gate to move on |
|---|---|---|---|
| **0 — "Prove it"** | Weeks 1–3 | Missed-Call Text-Back only, 3 design-partner businesses, call forwarding + A2P 10DLC registration, measure cost per conversation | **All three:** 3 live businesses · 30%+ of texted callers reply · all 3 agree to keep paying after the trial |
| **1 — MVP** | Weeks 4–10 | AI Receptionist (voice), onboarding wizard with website crawl, calendar booking, inbox + dashboard, Stripe billing | 10 paying customers |
| **2 — v1** | Months 3–5 | Flow editor, agency white-label, CRM + webhooks, web chat, appointment reminders, review requester | 25 paying customers |
| **3 — v2** | Month 6+ | Field-service integrations (Jobber, Housecall Pro, ServiceTitan), own voice pipeline, speed-to-lead, template library | — |

---

## 5. Phase 0 build plan — Missed-Call Text-Back

**Goal:** a real local business forwards unanswered calls to us; the caller hears a short greeting and gets a text within 10 s; Claude carries the SMS conversation and captures the lead; the owner gets an SMS on every new lead and can take over from the inbox.

**Exit gate (all three must be true):** 3 live businesses · 30%+ of texted callers reply · all 3 agree to keep paying after the trial.

### Confirmed scope
- **Hands-on onboarding.** You set up each business in a simple admin page (business name, hours, services, FAQs, tone). Owners don't sign up themselves; you invite them so they can see their inbox.
- **Not in Phase 0:** Stripe, website crawl, calendar booking, owner self-serve editor, voice AI.
- **Routing:** owner keeps their number and sets conditional "forward if unanswered/busy" to our Twilio number. **Any call that reaches Twilio = a missed call.** Twilio plays a short greeting ("Sorry we missed you, we'll text you right now"), hangs up (no voicemail), and we text the original caller ID within 10 s. Two-way AI SMS after that.
- **Owner alerts:** SMS on every new lead (email later).
- **Forwarding guide:** a public page with Verizon / AT&T / T-Mobile instructions you can send to owners.

### Start now, outside the code
Twilio A2P 10DLC approval can take days to weeks, and US carriers block unregistered business texts. In week 1, upgrade Twilio from trial, create your Trust Hub business profile, and collect each design partner's legal business details (name, EIN, address, website) for brand + campaign registration.

### Tasks (approve one at a time)

Each task ends with something you can check yourself.

**Week 1 — foundation**

| # | Task | Done when |
|---|---|---|
| **0.1** | **Scaffold.** `git init`, latest stable Next.js + TypeScript + Tailwind + shadcn/ui + ESLint/Prettier + Vitest, folder skeleton from section 2, `.env.example`, README. | `npm run dev` shows a placeholder page; lint, typecheck and tests pass. |
| **0.2** | **Deploy pipeline.** GitHub repo, Vercel project linked, preview deploy per branch. | A Vercel URL serves the placeholder page. |
| **0.3** | **Database.** Supabase dev + prod projects, Supabase CLI, migration `20261106120000_core.sql`, seed data, generated TS types, RLS tests. | Migration applies cleanly; RLS tests pass; types generated. |
| **0.4** | **Auth + admin gate.** Email magic-link login, invite-only (no public signup). `/admin` restricted to `PLATFORM_ADMIN_EMAILS`; owner dashboard routes protected by tenant membership. | You can log in and reach `/admin`; a non-admin account is refused. |
| **0.5** | **Admin: business setup.** Form to create/edit a business: name, timezone, hours, services, FAQs, tone, owner alert phone, voice greeting, first-text template. Saving creates the tenant + a `missed_call_textback` agent + a new live version (previous version kept for rollback). Invite owner by email. Plus a seed script for local dev. | You create a test business in the browser and see it in the DB with a live agent version. |
| **0.6** | **Twilio foundation.** Twilio client, webhook signature check, route skeletons for voice/sms/status that log and return empty TwiML. | A request without a valid signature gets 403; a real test call/text shows in logs. |
| **0.7** | **Number assignment.** Admin button: buy a local number (586/248/313), point its webhooks at the app, attach to the Messaging Service, save to `phone_numbers`. | The test business has a real Twilio number in Twilio and the DB. |

**Week 2 — the core loop**

| # | Task | Done when |
|---|---|---|
| **0.8** | **Missed call → greeting + first text.** Voice webhook: number → tenant → agent; skip anonymous/blocked/opted-out callers; dedupe repeat calls within a few minutes; create/reuse conversation; send personalized first text; return TwiML greeting + hang up. Log usage. | Call the test number → hear greeting → text arrives in under 10 s. Calling twice doesn't double-text. |
| **0.9** | **Inbound SMS + compliance.** SMS webhook: idempotent on MessageSid, STOP/START/HELP handled and logged in `sms_opt_outs`, message stored and routed to the open conversation. | Reply "STOP" → no more texts, opt-out recorded; normal replies appear in the DB. |
| **0.10** | **AI reply engine.** `lib/engine/run-turn.ts`: load live config + FAQs/services/hours, build prompt with tone + guardrails, call Claude with tools (`capture_lead`, `request_human`, `mark_spam`), send reply, log token usage. Short debounce so 3 quick texts get one answer. AI stays silent during human takeover. | A scripted test (FAQ, price question, emergency, spam) gets correct, guarded replies. |
| **0.11** | **Fallback.** If Claude errors or times out: canned "someone will reach out shortly" text + owner alert. | Forcing an API error still produces a customer text + owner alert. |
| **0.12** | **Leads + owner SMS alert.** `capture_lead` creates/updates the lead; owner gets an SMS on every new lead (name, need, urgency, link to thread); emergencies flagged at the top. | Finishing a test conversation creates a lead and texts the owner's phone. |
| **0.13** | **Inbox.** Conversation list + thread view with live updates, outcome tag, lead card. Works for owners (their business) and for you in admin (any business). | Texting the test number updates the open inbox without a refresh. |
| **0.14** | **Human takeover.** "Take over" pauses AI; reply from the inbox (sent via Twilio, stored as `sender = human`); "Hand back to AI". | You take over, reply from the browser, the customer gets it, AI stays silent. |

**Week 3 — go live with design partners**

| # | Task | Done when |
|---|---|---|
| **0.15** | **Carrier forwarding page + verification.** Public `/forwarding` page with Verizon, AT&T and T-Mobile "forward if unanswered/busy" steps (with the business's Twilio number filled in via link), plus a "Verify forwarding" check in admin that watches for the owner's test call. | You send the link to an owner, they set it up, and admin shows "forwarding verified". |
| **0.16** | **Gate metrics.** Per-business admin view: missed calls caught, texts sent, reply rate, leads, cost per conversation (Twilio + Claude from `usage_events`). Simple owner home: "This week: X missed calls caught, Y leads." | Numbers match the test data; reply rate and cost per conversation are visible. |
| **0.17** | **Hardening.** Error tracking, structured logs, cron to close idle conversations, per-contact SMS rate limit, data retention default. | 20 simultaneous test calls → 20 texts, no duplicates, no errors. |
| **0.18** | **A2P 10DLC.** Brand + campaign registration for each of the 3 partners (Twilio console, by hand), status shown in admin; texting blocked until approved. | All 3 partners show "approved". |
| **0.19** | **Pilot launch.** Onboard the 3 design partners, run the trial, track the exit gate. | Gate met (or not) — decide go/no-go for Phase 1. |

---

## 6. Env vars and accounts

### Accounts to create

| Account | Why | Phase 0 notes |
|---|---|---|
| **GitHub** | Code hosting, Vercel deploys | Private repo |
| **Vercel** | Hosting, preview deploys, cron | Pro plan likely needed for commercial use |
| **Supabase** | Postgres, auth, realtime | Created Nov 6, 2026 in org Chalifour Systems, us-east-1: `myaiagents-dev` (cucszeajnydygjcrzauv), `myaiagents-prod` (mbmiehrajylmuxcchawz). Supabase CLI only; no Docker (tests run against hosted dev). Prod needs a paid plan before the pilot: free projects pause after a week idle |
| **Twilio** | Numbers, voice webhooks, SMS | **Upgrade from trial** (trial only texts verified numbers). Create a Messaging Service. Complete **Trust Hub business profile** (your company as ISV) and **A2P 10DLC brand + campaign** registration — can take days to weeks; start immediately |
| **Anthropic Console** | Claude API | API key, set a monthly spend limit |
| **Domain registrar / DNS** | App domain | Depends on brand decision (open question 1) |
| **Resend** (optional) | Custom SMTP for Supabase login emails | Supabase's built-in email is rate-limited; fine for a handful of Phase 0 users, switch before Phase 1. Owner email alerts come later |
| **Sentry** (optional) | Error tracking | Free tier is fine |

Later phases (don't set up yet): Stripe (billing), Vapi / Retell / ElevenLabs Agents (voice), Cloudflare R2 (recordings), Inngest or Trigger.dev (background jobs), an embeddings provider such as Voyage AI (knowledge search), Google Cloud OAuth + Cal.com (calendar booking).

### `.env.example`

```bash
# --- App ---
NEXT_PUBLIC_APP_URL=                 # https://app.<yourdomain> (used in alert links + Twilio webhook URLs)

# --- Supabase ---
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=       # or the newer "publishable" key
SUPABASE_SERVICE_ROLE_KEY=           # or the newer "secret" key — SERVER ONLY, never NEXT_PUBLIC
SUPABASE_PROJECT_REF=                # for `supabase gen types` / migrations
SUPABASE_DB_PASSWORD=                # CLI migrations only, not needed on Vercel

# --- Twilio ---
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=                   # also used to verify X-Twilio-Signature on webhooks
TWILIO_API_KEY_SID=                  # preferred for REST calls (rotatable)
TWILIO_API_KEY_SECRET=
TWILIO_MESSAGING_SERVICE_SID=        # default Messaging Service (per-tenant SIDs live in DB)

# --- Anthropic ---
ANTHROPIC_API_KEY=
ANTHROPIC_MODEL_FAST=claude-haiku-5-5    # live SMS turns
ANTHROPIC_MODEL_SMART=claude-sonnet-5-5  # summaries, extraction

# --- Admin ---
PLATFORM_ADMIN_EMAILS=               # comma-separated; who can open /admin (you)

# --- Ops ---
CRON_SECRET=                         # Vercel Cron auth header for /api/cron/*
SENTRY_DSN=                          # optional
INTERNAL_ALERT_PHONE=                # your cell, for system failures
```

---

## 7. Decisions and open questions

### Decided (Nov 6, 2026)
- **No prior codebase** — start fresh.
- **Roadmap and Phase 0 exit gate** — section 4.
- **Phase 0 is hands-on** — admin page for setup; no Stripe, crawl or calendar.
- **Routing** — conditional forwarding to our Twilio number; any call reaching Twilio is a missed call; greeting, hang up, text within 10 s; no voicemail.
- **Owner alerts** — SMS on every new lead.
- **Framework** — latest stable Next.js (16.4.5 today), not 14.

### Still open (not blocking Task 0.1)
1. **Brand + domain.** myaiagents.so or a new name? Needed by Task 0.2 (domain) and for A2P brand registration.
2. **Design partners.** Who are the 3 businesses? A2P registration needs their legal details early.
3. **A2P setup.** Register each business as its own brand under your account (standard for reselling), or another approach?
4. **Reply-to-alert takeover.** PRD lets owners take over by replying to the alert text. Phase 0 plan is inbox-only takeover — OK to defer reply-by-text?
5. **Med spas.** Exclude from the Phase 0 pilot given the PRD's HIPAA caution?
