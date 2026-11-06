AI Agent Builder — PRD
Nov 6, 2026 · @Austyn Chalifour
Overview and vision
We are building an AI agent builder that lets a local business owner, or the agency serving them, go from a website URL to a live, phone-answering agent in under 10 minutes. It ships with production-grade templates — AI Receptionist and Missed-Call Text-Back first — on one shared engine, so every new agent type is a template, not a new codebase.
The pitch: "Your front desk never misses a call again. Paste your website, pick an agent, forward your number. Done."
What "really good" means here. Most builders in this space are either developer toolkits (powerful, but a plumber can't use them) or rigid point products (easy, but you can't change anything). We win by being both:
• Instant for owners — templates that work out of the box, auto-trained from the business's website and Google Business Profile.
• Deep for builders — every template is editable down to the flow, tools, and guardrails, so agencies can customize without code.
• Obsessed with the phone — sub-second voice latency, natural interruptions, clean handoff to a human, and real outcomes (booked jobs) instead of transcripts.
Relation to myaiagents.so. The earlier plan was to sell narrow single-job agents à la carte rather than build a platform. This PRD keeps that go-to-market and changes the back end: customers still buy one agent at a time ("$X/mo for a missed-call agent"), but every agent is built on the same builder engine. The builder is the moat; the templates are the storefront.
Problem and target users
Local service businesses lose real money to unanswered phones. The owner is on a job site, in a treatment room, or behind a counter, and the caller just dials the next result on Google. Existing fixes are a human answering service (expensive, scripted, business-hours only) or voicemail (most callers never leave one).
Beachhead: home services and appointment-based businesses in Macomb County and metro Detroit — plumbers, HVAC, med spas, salons, auto shops, restaurants. These line up with work already underway (Macomb Plumbing Websites, the med spa template, Macomb Code).
Persona
Who they are
Job to be done
What they need from us
Owner-operator
Plumber, med spa owner, 1–15 staff
"Stop losing jobs when I can't pick up"
Setup in minutes, no jargon, proof of booked jobs
Front-desk manager
Runs scheduling at a busier shop
"Handle overflow and after-hours so I'm not buried"
Calendar sync, clean handoffs, call summaries
Agency / reseller
Macomb Code, GHL-style agencies
"Sell AI agents to my clients under my brand"
Sub-accounts, white-label, templates, margin
Power builder
Freelancer or technical agency
"Build a custom agent for a weird workflow"
Flow editor, custom tools, webhooks, API
Goals, non-goals, success metrics
Goals
1. A non-technical owner launches a working agent in under 10 minutes, with no call to us.
2. Agents sound natural enough that most callers don't hang up or ask "is this a robot?" in the first 15 seconds.
3. Every agent proves its value with a number the owner cares about: calls answered, leads captured, jobs booked.
4. One engine powers every agent type; a new template ships in days, not weeks.
5. Agencies can resell it under their own brand.
Non-goals (v1)
• Outbound cold-calling or sales dialers (compliance risk, different product).
• A general-purpose "build any AI agent" platform for enterprises.
• Building our own speech models or telephony carrier.
• A native mobile app (responsive web dashboard + SMS/email alerts first).
Success metrics
Metric
Target at 90 days post-launch
Time from signup to first live call
Median under 10 min
Activation (agent receives a real call within 7 days)
60%+ of signups
Calls fully handled without human handoff
70%+
Missed-call text-back reply rate
30%+ of texted callers respond
Voice response latency (end of speech → agent audio)
p50 under 800 ms, p95 under 1.5 s
Paying customers
25 local businesses
Monthly logo churn
Under 5%
These targets are starting assumptions to validate with the first 10 customers.
Agent templates
Two templates launch at MVP; the rest ship as the engine matures. Each template is a pre-wired bundle of channels, a flow, tools, and a default prompt, and every part is editable.
1. AI Receptionist (flagship)
Answers inbound calls 24/7 like a trained front-desk person.
• Greets with the business name and handles FAQs (hours, service area, pricing ranges, directions) from the knowledge base.
• Qualifies the caller: name, callback number, address or service area check, what they need, urgency.
• Books, reschedules, or cancels appointments against a live calendar (Google Calendar, Cal.com, Calendly; later Jobber, Housecall Pro, ServiceTitan).
• Detects emergencies ("water is pouring through my ceiling") and warm-transfers to the on-call number, or texts the owner immediately.
• Takes a message when it can't help, then sends the owner an SMS/email summary with transcript and recording.
• Business-hours modes: overflow only, after-hours only, or always on.
2. Missed-Call Text-Back
When a call goes unanswered, texts the caller within 10 seconds and keeps the conversation going over SMS.
• Personalized first text: "Hi, this is Mike's Plumbing — sorry we missed you! What can we help with?"
• Two-way AI SMS that answers questions, qualifies, and books or offers a callback slot.
• Hands the thread to a human with one tap from the dashboard or by replying to the alert.
• Works standalone (cheapest entry product) or as a fallback behind the Receptionist.
Roadmap templates
Template
What it does
Built from
Appointment Reminder + Confirm
Texts/calls to confirm, reschedules no-shows
Calendar trigger + SMS + voice
Review Requester
Asks happy customers for a Google review after a job
Job-complete webhook + SMS
Website Chat Agent
Same brain as the Receptionist on a site widget
Web chat channel
Lead Qualifier / Speed-to-Lead
Calls or texts new form leads within 60 seconds
Form webhook + outbound (consented)
Database Reactivation
Re-engages past customers with an offer
CSV import + SMS campaign (opt-in only)
After-Hours Emergency Dispatcher
Triage and page the on-call tech
Receptionist variant + escalation tree
Order-Taking (restaurants)
Takes pickup orders by phone
Menu knowledge + POS tool
Custom agents: power builders start from a blank template using the same blocks.
Builder experience
The whole product hinges on the first 10 minutes: an owner should hear their own agent answer a call before they finish their coffee.
Onboarding wizard (the "magic path")
1. Paste your website or Google Business Profile. We crawl it and extract business name, services, hours, service area, pricing hints, and FAQs into a draft knowledge base.
2. Pick a template. Receptionist, Missed-Call Text-Back, or both.
3. Review the auto-filled brain. A plain-English checklist ("We think you're open Mon–Fri 7–6. Correct?"), with a few required gaps flagged.
4. Pick a voice and greeting. Six to eight curated voices with instant previews; optional voice clone for the owner's own voice.
5. Test it. "Call me now" button rings the owner's cell, or talk in the browser. Live transcript shows what the agent heard and why it did what it did.
6. Go live. Get a new local number, or forward an existing line with carrier-specific instructions ("On Verizon, dial *71 + number"). SMS registration runs in the background.
The builder (for customizing)
• Simple mode: a form-based editor — Greeting, What you do, FAQs, What to collect, When to transfer, Booking rules. Covers 90% of owners.
• Flow mode: a visual canvas of nodes (Say, Ask, Branch, Tool, Transfer, End) for agencies and power users. Prompt-driven by default; flow nodes add hard rails where the business needs certainty.
• Test console: simulated calls with personas ("angry customer", "emergency leak", "price shopper"), side-by-side diff when the prompt changes, and saved test cases that rerun on every publish.
• Versioning: draft vs. live, one-click rollback, change history.
Learning from calls. After each call, owners can flag a bad answer and type the right one. That correction goes into the knowledge base and a regression test automatically.
Functional requirements
Every agent is assembled from the same six building blocks. Priority: P0 = MVP, P1 = v1, P2 = later.
Block
Requirement
Priority
Channels
Inbound voice on a provisioned or forwarded number
P0
Channels
Two-way SMS, triggered by missed call or inbound text
P0
Channels
Web chat widget; outbound voice (consented leads only)
P1
Knowledge
Website crawl + GBP import into a structured knowledge base
P0
Knowledge
Manual FAQs, PDF/doc upload, pricing tables
P0
Knowledge
Auto re-crawl weekly; per-answer source citations in logs
P1
Tools / actions
Calendar booking (Google Calendar, Cal.com)
P0
Tools / actions
Send SMS/email to owner; create lead in dashboard
P0
Tools / actions
Webhooks + Zapier/Make; CRM push (GHL, HubSpot)
P1
Tools / actions
Field-service integrations (Jobber, Housecall Pro, ServiceTitan)
P2
Flow
Prompt-driven agent with configurable required fields
P0
Flow
Visual flow editor with branch and tool nodes
P1
Guardrails
Never quote outside price ranges; never promise arrival times unless configured
P0
Guardrails
Topic blocklist, profanity handling, max call length, spam/robocall filter
P0
Guardrails
AI disclosure line and recording-consent notice, on by default
P0
Handoff
Warm transfer to a number with whisper summary; text owner on escalation
P0
Handoff
Take-over of live SMS threads from the dashboard
P0
Handoff
Escalation trees (try owner, then tech 2, then voicemail)
P1
Dashboard and analytics (P0)
• Inbox of every call and text: recording, transcript, AI summary, outcome tag (booked, lead, FAQ, spam, transferred).
• Home screen leads with money: "This week: 37 calls answered, 14 leads, 6 booked jobs — about $X in revenue" (owner sets average job value).
• Instant alerts by SMS/email/push for new leads and escalations.
Multi-tenant and agency (P1)
• Agency workspace with client sub-accounts, template library shared across clients, and usage roll-ups.
• White-label: custom domain, logo, colors, and emails; agency sets its own retail prices on top of wholesale.
• Roles: agency admin, client owner, client staff (inbox only).
Technical architecture and stack
Reuse the stack already proven on the missed-call prototype — Next.js, Supabase, Twilio, Claude, Vercel — and buy the hardest real-time piece (voice) at MVP instead of building it.
Calls and texts enter through Twilio; voice streams through the voice layer, while SMS goes straight to the runtime by webhook. Every template runs on the same runtime, which reads its config from Supabase.
Layer
MVP choice
Later
App + dashboard
Next.js 14 on Vercel
—
Database, auth, storage
Supabase (Postgres, RLS per tenant, pgvector for KB search)
Read replicas as volume grows
Telephony + SMS
Twilio (numbers, forwarding, A2P 10DLC, Messaging)
Telnyx for cost at scale
Voice pipeline
Managed: Vapi, Retell, or ElevenLabs Agents, with our runtime as the tool/LLM backend
Own pipeline (streaming STT + TTS) to cut per-minute cost
LLM
Claude: fast model for live turns, larger model for summaries and KB extraction
Model routing per turn
Background jobs
Trigger.dev or Inngest (crawls, summaries, alerts, retries)
—
Recordings
Cloudflare R2
—
Billing
Stripe subscriptions + metered usage
Agency rebilling
Core data model: tenants (agency → business), agents, agent_versions, knowledge_items, phone_numbers, conversations, messages, leads, bookings, tool_connections, test_cases, usage_events.
Latency budget per voice turn (target p50 under 800 ms): end-of-speech detection ~200 ms, STT final ~100 ms, LLM first token ~300 ms, TTS first audio ~150 ms. Stream every hop; never wait for a full LLM response before speaking.
Reliability: if the runtime or LLM fails mid-call, fall back to a canned "let me have someone call you right back" plus an instant owner alert, so no call is ever lost.
Pricing and packaging
Sell agents one at a time, priced against what a missed job costs (often $200–$2,000 for a plumber), not against software. Voice carries real per-minute cost, so it needs a higher floor than the earlier $29–49 idea; text-back can stay near it.
Plan
Price (hypothesis)
Includes
Missed-Call Text-Back
$49/mo
1 number, 500 SMS segments, AI replies, inbox
AI Receptionist
$149/mo
300 voice minutes, booking, transfers, text-back included
Receptionist Pro
$299/mo
1,000 minutes, CRM/webhooks, custom flows, 2 locations
Overage
$0.20/min voice, $0.03/SMS
Billed monthly via Stripe metering
Agency
Wholesale ~50% off retail + $97/mo platform fee
Unlimited sub-accounts, white-label, reseller pricing
• 14-day free trial with a test number; card required to port or forward a real line.
• Optional done-for-you setup ($299 one-time), which doubles as a Macomb Code upsell.
• Target gross margin of 70%+ after telephony, voice, and LLM costs; validate unit cost per minute in the first build sprint.
Roadmap
Ship the cheapest agent first to real businesses, add voice once text-back is paying, and only build the full builder and agency layer after 10 paying customers prove the core.
Each gate is a go/no-go: don't start the next phase's features until its gate is met. Phase 0 reuses the existing missed-call build, so the real work starts at Phase 1. Weeks assume solo, part-time building alongside the day job; adjust after Phase 0.
Risks, compliance, and open questions
Compliance (must be in the MVP, not bolted on)
• A2P 10DLC registration. US carriers block business SMS from unregistered numbers. Automate brand + campaign registration through Twilio during onboarding, and show status clearly; approval can take days, so the voice agent should work before SMS is cleared.
• TCPA and consent. Replying to someone who just called the business is generally treated as conversational, but marketing texts and outbound calls need prior consent. Keep outbound and reactivation templates opt-in only, honor STOP instantly, and log consent. The FCC treats AI-generated voices as "artificial" under the TCPA, so no unconsented outbound AI calls.
• Call recording consent. Michigan is one-party consent, but callers can be in all-party states (e.g. California, Florida). Play a short recording/AI disclosure by default.
• Data. Encrypt recordings at rest, set retention defaults, and keep med spa use cases away from storing clinical details until HIPAA is addressed.
Not legal advice — have these reviewed before launch.
Product risks
Risk
Mitigation
Agent says something wrong or promises a price
Guardrails, grounded answers only, "I'll have someone confirm" fallback, call review loop
Latency makes calls feel robotic
Streaming end to end, managed voice layer, latency budget per hop, regional hosting
Crowded market (GHL Voice AI, Synthflow, Retell- and Vapi-based agencies)
Win on local focus, setup speed, outcome reporting, and in-person sales in Macomb County
Per-minute costs erode margin
Metered overage, caching FAQ answers, cheaper model for simple turns
Carrier forwarding confuses owners
Carrier-specific guides, test call that verifies forwarding works
Solo-builder bandwidth across many projects
Ship two templates only at MVP; defer flow editor and agency features
Open questions
[ ] Brand: launch under myaiagents.so, or a new name? Does it sit inside Macomb Core (the GHL whitelabel) or replace that plan?
[ ] Build voice on a managed layer (Vapi, Retell, ElevenLabs Agents) or own the pipeline from day one?
[ ] Which calendar and field-service integration do the first 10 customers actually use?
[ ] Final pricing after measuring real cost per minute.
[ ] Who are the 5 design-partner businesses for the beta?