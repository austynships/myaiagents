-- Dev-only seed data. NEVER run against production.
-- One fictional business with a Missed-Call Text-Back agent, a live config,
-- services, FAQs and a placeholder (555) number. Fixed UUIDs keep it re-runnable.

begin;

insert into public.tenants (id, kind, name, timezone, owner_alert_phone, avg_job_value_cents, business_hours)
values (
  '00000000-0000-4000-8000-000000000001', 'business', 'Mike''s Plumbing (TEST)', 'America/Detroit',
  '+15555550199', 45000,
  '{"mon":["07:00","18:00"],"tue":["07:00","18:00"],"wed":["07:00","18:00"],"thu":["07:00","18:00"],"fri":["07:00","18:00"],"sat":["08:00","12:00"],"sun":null}'
)
on conflict (id) do nothing;

insert into public.agents (id, tenant_id, template, name, status)
values ('00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000000001',
        'missed_call_textback', 'Missed-Call Text-Back', 'active')
on conflict (id) do nothing;

insert into public.agent_versions (id, tenant_id, agent_id, version, status, config, notes, published_at)
values (
  '00000000-0000-4000-8000-000000000201', '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000101', 1, 'live',
  '{
     "voice_greeting": "Sorry we missed you! We''ll text you right now.",
     "first_text": "Hi, this is Mike''s Plumbing. Sorry we missed your call! What can we help you with?",
     "tone": "Friendly, plain-spoken, short texts. No emojis.",
     "required_fields": ["name", "service_needed", "address", "urgency"],
     "guardrails": {
       "price_ranges_only": true,
       "promise_arrival_times": false,
       "max_reply_chars": 320,
       "blocked_topics": []
     },
     "handoff": { "emergency_keywords": ["flood", "burst", "gas", "sewage", "no water"] }
   }',
  'Seed version', now()
)
on conflict (id) do nothing;

update public.agents
set live_version_id = '00000000-0000-4000-8000-000000000201'
where id = '00000000-0000-4000-8000-000000000101';

insert into public.knowledge_items (id, tenant_id, agent_id, kind, title, content, sort_order) values
  ('00000000-0000-4000-8000-000000000301', '00000000-0000-4000-8000-000000000001', null, 'service',
   'Drain cleaning', 'Kitchen, bathroom and main-line drain cleaning. Camera inspection available.', 1),
  ('00000000-0000-4000-8000-000000000302', '00000000-0000-4000-8000-000000000001', null, 'service',
   'Water heaters', 'Tank and tankless water heater repair and replacement.', 2),
  ('00000000-0000-4000-8000-000000000303', '00000000-0000-4000-8000-000000000001', null, 'service_area',
   'Service area', 'Macomb County: Sterling Heights, Warren, Clinton Township, Shelby Township, Macomb.', 3),
  ('00000000-0000-4000-8000-000000000304', '00000000-0000-4000-8000-000000000001', null, 'faq',
   'How much is a service call?', 'Service calls are $89, waived if we do the repair.', 4),
  ('00000000-0000-4000-8000-000000000305', '00000000-0000-4000-8000-000000000001', null, 'pricing',
   'Drain cleaning price', 'Drain cleaning usually runs $150-$350 depending on the line.', 5)
on conflict (id) do nothing;

insert into public.phone_numbers (id, tenant_id, agent_id, e164, source, forwarded_from_e164, a2p_status)
values ('00000000-0000-4000-8000-000000000401', '00000000-0000-4000-8000-000000000001',
        '00000000-0000-4000-8000-000000000101', '+15555550100', 'provisioned', '+15555550111', 'not_started')
on conflict (id) do nothing;

commit;
