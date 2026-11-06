# AI Agent Builder for Local Businesses

AI agents for local service businesses: Missed-Call Text-Back first, then an AI Receptionist, all built on one shared engine.

- Product requirements: [`PRD.MD`](PRD.MD)
- Build plan, schema, roadmap and task list: [`docs/build-plan.md`](docs/build-plan.md)

**Current phase:** Phase 0, "Prove it" (Missed-Call Text-Back with 3 design partners).

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 + shadcn/ui · Supabase · Twilio · Claude API · Vercel

## Run it locally

Requires Node.js 24.

```bash
npm install
cp .env.example .env.local   # fill in values as each service gets set up
npm run dev                  # http://localhost:3000
```

## Scripts

| Command              | What it does                      |
| -------------------- | --------------------------------- |
| `npm run dev`        | Start the dev server              |
| `npm run build`      | Production build                  |
| `npm run lint`       | ESLint                            |
| `npm run typecheck`  | TypeScript check, no output files |
| `npm test`           | Run tests once (Vitest)           |
| `npm run test:watch` | Re-run tests on change            |
| `npm run format`     | Format with Prettier              |

## Layout

```
app/          routes: (marketing) public pages, (auth) login, (app) owner dashboard,
              admin/ platform-admin setup, api/ Twilio webhooks + cron
lib/engine/   shared agent runtime (template-agnostic)
lib/templates/ per-template defaults (missed-call-textback first)
lib/          supabase, twilio, ai, alerts, compliance helpers
supabase/     migrations, seed data, RLS tests
tests/        Vitest tests
```

Empty folders contain a `.gitkeep` until their task in the build plan fills them in.

## Notes for AI coding agents

See [`AGENTS.md`](AGENTS.md). Next.js 16 differs from older versions (for example, `middleware.ts` is now `proxy.ts`, and route `params` are async). Check `node_modules/next/dist/docs/` before writing Next.js code.
