-- =========================================================
-- Core multi-tenant data model (Task 0.3)
-- See docs/build-plan.md section 3 for the design notes.
--
-- Security model:
--   * Every row carries tenant_id; RLS checks membership via private.can_access /
--     private.can_manage (security definer, so no policy recursion).
--   * The browser uses the `authenticated` role and is limited by RLS.
--   * Twilio webhooks and admin actions use the service role, which bypasses RLS.
-- =========================================================

create extension if not exists vector with schema extensions;  -- knowledge search (Phase 1)

create schema if not exists private;  -- helpers; not exposed through the Data API

-- ---------- enums ----------
create type public.tenant_kind        as enum ('agency', 'business');
create type public.member_role        as enum ('agency_admin', 'owner', 'staff');
create type public.agent_template     as enum ('missed_call_textback', 'receptionist', 'custom');
create type public.agent_status       as enum ('draft', 'active', 'paused', 'archived');
create type public.version_status     as enum ('draft', 'live', 'archived');
create type public.knowledge_kind     as enum ('faq', 'service', 'web_page', 'document', 'pricing', 'hours', 'service_area', 'correction', 'other');
create type public.number_source      as enum ('provisioned', 'ported');
create type public.a2p_status         as enum ('not_started', 'pending', 'approved', 'rejected');
create type public.channel_kind       as enum ('voice', 'sms', 'web_chat');
create type public.conversation_state as enum ('ai_active', 'human_takeover', 'closed');
create type public.outcome_tag        as enum ('booked', 'lead', 'faq', 'spam', 'transferred', 'no_response', 'other');
create type public.msg_direction      as enum ('inbound', 'outbound');
create type public.msg_sender         as enum ('contact', 'ai', 'human', 'system');
create type public.lead_status        as enum ('new', 'contacted', 'booked', 'won', 'lost');
create type public.usage_kind         as enum ('sms_out_segment', 'sms_in_segment', 'voice_minute', 'llm_input_tokens', 'llm_output_tokens', 'phone_number_month');

-- ---------- updated_at helper ----------
create function private.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- =========================================================
-- tenants & membership
-- =========================================================
create table public.tenants (
  id                  uuid primary key default gen_random_uuid(),
  kind                public.tenant_kind not null default 'business',
  parent_tenant_id    uuid references public.tenants(id) on delete restrict,
  name                text not null,
  timezone            text not null default 'America/Detroit',
  owner_alert_phone   text,                       -- E.164, where lead texts go
  owner_alert_email   text,
  avg_job_value_cents integer check (avg_job_value_cents >= 0),
  business_hours      jsonb not null default '{}'::jsonb,
  settings            jsonb not null default '{}'::jsonb,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  constraint agencies_have_no_parent check (kind = 'business' or parent_tenant_id is null)
);
create index tenants_parent_idx on public.tenants (parent_tenant_id);
create trigger tenants_touch before update on public.tenants
  for each row execute function private.touch_updated_at();

create table public.tenant_members (
  tenant_id  uuid not null references public.tenants(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  role       public.member_role not null default 'owner',
  created_at timestamptz not null default now(),
  primary key (tenant_id, user_id)
);
create index tenant_members_user_idx on public.tenant_members (user_id);

-- ---------- RLS helpers ----------
-- Member of the tenant itself, or of its parent agency.
create function private.can_access(t uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1
    from public.tenant_members m
    join public.tenants tt on tt.id = t
    where m.user_id = (select auth.uid())
      and (m.tenant_id = tt.id or m.tenant_id = tt.parent_tenant_id)
  );
$$;

-- Can change config: owner/agency_admin of the business, or agency_admin of its parent.
create function private.can_manage(t uuid) returns boolean
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

revoke all on schema private from public;
grant usage on schema private to authenticated, service_role;
revoke execute on function private.can_access(uuid), private.can_manage(uuid) from public;
grant execute on function private.can_access(uuid), private.can_manage(uuid) to authenticated, service_role;

-- Self-serve signup (Phase 1): create a business and make the caller its owner.
-- In Phase 0 businesses are created from /admin with the service role instead.
create function public.create_business(p_name text, p_timezone text default 'America/Detroit')
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_id uuid;
begin
  if (select auth.uid()) is null then
    raise exception 'not authenticated';
  end if;
  insert into public.tenants (kind, name, timezone) values ('business', p_name, p_timezone)
    returning id into v_id;
  insert into public.tenant_members (tenant_id, user_id, role)
    values (v_id, (select auth.uid()), 'owner');
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
  template        public.agent_template not null,
  name            text not null,
  status          public.agent_status not null default 'draft',
  live_version_id uuid,                            -- FK added below
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (id, tenant_id)
);
create index agents_tenant_idx on public.agents (tenant_id);
create trigger agents_touch before update on public.agents
  for each row execute function private.touch_updated_at();

create table public.agent_versions (
  id           uuid primary key default gen_random_uuid(),
  tenant_id    uuid not null,
  agent_id     uuid not null,
  version      integer not null check (version > 0),
  status       public.version_status not null default 'draft',
  -- Everything the runtime needs: voice greeting, first text, tone, prompt,
  -- required fields, guardrails, handoff rules, tool settings.
  config       jsonb not null,
  notes        text,
  created_by   uuid references auth.users(id) on delete set null,
  created_at   timestamptz not null default now(),
  published_at timestamptz,
  unique (agent_id, version),
  unique (id, tenant_id),
  unique (id, agent_id),                           -- target for agents.live_version_id FK
  foreign key (agent_id, tenant_id) references public.agents(id, tenant_id) on delete cascade
);
create unique index agent_versions_one_live on public.agent_versions (agent_id) where status = 'live';

-- The live version must belong to this same agent.
alter table public.agents
  add constraint agents_live_version_fk
  foreign key (live_version_id, id) references public.agent_versions(id, agent_id)
  deferrable initially deferred;

-- =========================================================
-- knowledge
-- =========================================================
create table public.knowledge_items (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references public.tenants(id) on delete cascade,
  agent_id    uuid,                                -- null = shared by all the tenant's agents
  kind        public.knowledge_kind not null,
  title       text,
  content     text not null,
  source_url  text,
  enabled     boolean not null default true,
  sort_order  integer not null default 0,
  embedding   extensions.vector(1024),             -- filled in Phase 1; dims depend on embedding model
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  foreign key (agent_id, tenant_id) references public.agents(id, tenant_id) on delete cascade
);
create index knowledge_items_tenant_agent_idx on public.knowledge_items (tenant_id, agent_id);
create trigger knowledge_items_touch before update on public.knowledge_items
  for each row execute function private.touch_updated_at();

-- =========================================================
-- phone numbers
-- =========================================================
create table public.phone_numbers (
  id                     uuid primary key default gen_random_uuid(),
  tenant_id              uuid not null references public.tenants(id) on delete cascade,
  agent_id               uuid,                     -- which agent answers this number
  e164                   text not null unique check (e164 ~ '^\+[1-9][0-9]{6,14}$'),
  twilio_sid             text unique,
  source                 public.number_source not null default 'provisioned',
  forwarded_from_e164    text,                     -- the owner's real business line
  forwarding_verified_at timestamptz,
  messaging_service_sid  text,
  a2p_status             public.a2p_status not null default 'not_started',
  a2p_notes              text,
  active                 boolean not null default true,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),
  unique (id, tenant_id),
  foreign key (agent_id, tenant_id) references public.agents(id, tenant_id) on delete set null (agent_id)
);
create index phone_numbers_tenant_idx on public.phone_numbers (tenant_id);
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
  channel          public.channel_kind not null,
  contact_phone    text not null,                  -- E.164 of the caller/texter
  contact_name     text,
  state            public.conversation_state not null default 'ai_active',
  outcome          public.outcome_tag,
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
-- One open thread per (our number, caller): repeat calls/texts join the same thread.
create unique index conversations_one_open
  on public.conversations (phone_number_id, contact_phone) where state <> 'closed';
create index conversations_tenant_recent_idx on public.conversations (tenant_id, last_message_at desc);

create table public.messages (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null,
  conversation_id uuid not null,
  direction       public.msg_direction not null,
  sender          public.msg_sender not null,
  sent_by_user    uuid references auth.users(id) on delete set null,  -- when sender = 'human'
  body            text not null,
  twilio_sid      text unique,                     -- idempotency: Twilio retries webhooks
  delivery_status text,                            -- queued/sent/delivered/failed/undelivered
  error_code      text,
  segments        smallint,
  created_at      timestamptz not null default now(),
  foreign key (conversation_id, tenant_id) references public.conversations(id, tenant_id) on delete cascade
);
create index messages_conversation_idx on public.messages (conversation_id, created_at);
create index messages_tenant_recent_idx on public.messages (tenant_id, created_at desc);

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
  status                public.lead_status not null default 'new',
  estimated_value_cents integer check (estimated_value_cents >= 0),
  fields                jsonb not null default '{}'::jsonb,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  foreign key (conversation_id, tenant_id) references public.conversations(id, tenant_id) on delete set null (conversation_id)
);
create index leads_tenant_recent_idx on public.leads (tenant_id, created_at desc);
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
  kind            public.usage_kind not null,
  quantity        numeric not null check (quantity >= 0),
  unit_cost_usd   numeric(12, 6),                  -- our cost, for margin tracking
  model           text,                            -- for llm_* kinds
  metadata        jsonb not null default '{}'::jsonb,
  occurred_at     timestamptz not null default now()
);
create index usage_events_tenant_time_idx on public.usage_events (tenant_id, occurred_at);

-- =========================================================
-- SMS opt-outs (TCPA / carrier STOP handling)
-- =========================================================
create table public.sms_opt_outs (
  tenant_id     uuid not null references public.tenants(id) on delete cascade,
  contact_phone text not null,
  opted_out_at  timestamptz not null default now(),
  opted_in_at   timestamptz,                       -- set on START; null = currently opted out
  keyword       text,
  primary key (tenant_id, contact_phone)
);

-- =========================================================
-- Table privileges (explicit, rather than relying on platform defaults).
-- RLS below decides which rows; these decide which operations are possible at all.
-- =========================================================
revoke all on all tables in schema public from anon, authenticated;
grant all on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to service_role;

grant select, update                 on public.tenants         to authenticated;
grant select, insert, update, delete on public.tenant_members  to authenticated;
grant select, insert, update, delete on public.agents          to authenticated;
grant select, insert, update         on public.agent_versions  to authenticated;
grant select, insert, update, delete on public.knowledge_items to authenticated;
grant select                         on public.phone_numbers   to authenticated;
grant select, update                 on public.conversations   to authenticated;
grant select                         on public.messages        to authenticated;
grant select, update                 on public.leads           to authenticated;
grant select                         on public.usage_events    to authenticated;
grant select                         on public.sms_opt_outs    to authenticated;

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

-- tenants: members read; managers update; inserts only via create_business() or the service role
create policy tenants_select on public.tenants for select to authenticated
  using (private.can_access(id));
create policy tenants_update on public.tenants for update to authenticated
  using (private.can_manage(id)) with check (private.can_manage(id));

-- tenant_members: see teammates; managers add/change/remove
create policy members_select on public.tenant_members for select to authenticated
  using (private.can_access(tenant_id));
create policy members_insert on public.tenant_members for insert to authenticated
  with check (private.can_manage(tenant_id));
create policy members_update on public.tenant_members for update to authenticated
  using (private.can_manage(tenant_id)) with check (private.can_manage(tenant_id));
create policy members_delete on public.tenant_members for delete to authenticated
  using (private.can_manage(tenant_id));

-- agents: members read; managers write
create policy agents_select on public.agents for select to authenticated
  using (private.can_access(tenant_id));
create policy agents_insert on public.agents for insert to authenticated
  with check (private.can_manage(tenant_id));
create policy agents_update on public.agents for update to authenticated
  using (private.can_manage(tenant_id)) with check (private.can_manage(tenant_id));
create policy agents_delete on public.agents for delete to authenticated
  using (private.can_manage(tenant_id));

-- agent_versions: members read; managers create/edit drafts only.
-- Publishing (draft -> live) happens server-side with the service role.
create policy versions_select on public.agent_versions for select to authenticated
  using (private.can_access(tenant_id));
create policy versions_insert on public.agent_versions for insert to authenticated
  with check (private.can_manage(tenant_id) and status = 'draft');
create policy versions_update on public.agent_versions for update to authenticated
  using (private.can_manage(tenant_id) and status = 'draft')
  with check (private.can_manage(tenant_id) and status = 'draft');

-- knowledge: members read; managers write
create policy knowledge_select on public.knowledge_items for select to authenticated
  using (private.can_access(tenant_id));
create policy knowledge_insert on public.knowledge_items for insert to authenticated
  with check (private.can_manage(tenant_id));
create policy knowledge_update on public.knowledge_items for update to authenticated
  using (private.can_manage(tenant_id)) with check (private.can_manage(tenant_id));
create policy knowledge_delete on public.knowledge_items for delete to authenticated
  using (private.can_manage(tenant_id));

-- phone numbers: read-only from the browser (buying/assigning is server-side)
create policy numbers_select on public.phone_numbers for select to authenticated
  using (private.can_access(tenant_id));

-- inbox: any member (incl. staff) reads and updates; no browser inserts/deletes
-- (outbound human replies are inserted server-side after Twilio accepts them)
create policy conversations_select on public.conversations for select to authenticated
  using (private.can_access(tenant_id));
create policy conversations_update on public.conversations for update to authenticated
  using (private.can_access(tenant_id)) with check (private.can_access(tenant_id));

create policy messages_select on public.messages for select to authenticated
  using (private.can_access(tenant_id));

create policy leads_select on public.leads for select to authenticated
  using (private.can_access(tenant_id));
create policy leads_update on public.leads for update to authenticated
  using (private.can_access(tenant_id)) with check (private.can_access(tenant_id));

-- usage + opt-outs: read-only for members
create policy usage_select on public.usage_events for select to authenticated
  using (private.can_access(tenant_id));
create policy opt_outs_select on public.sms_opt_outs for select to authenticated
  using (private.can_access(tenant_id));

-- =========================================================
-- Realtime: live inbox updates (Realtime respects RLS)
-- =========================================================
alter publication supabase_realtime add table public.conversations, public.messages;
