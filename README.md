# FlowHub

A self-hostable workflow automation platform. Build automations on a visual canvas by
connecting trigger and action nodes, then let them run durably in the background.

FlowHub is an n8n-style builder focused on AI workflows: wire a Google Form submission or
a Stripe event into an LLM node, then push the result to Discord or Slack.

---

## Features

**Visual workflow editor** — Drag nodes onto a React Flow canvas, connect them, and
configure each one through a dialog. The graph is persisted to Postgres as nodes and
connections.

**Durable execution** — Workflows run as [Inngest](https://www.inngest.com/) functions
rather than in a request handler. Each node is a separate step, so a run survives
timeouts and deploys, and retries on failure without re-running completed nodes.

**Live run status** — Node status streams back to the canvas over Inngest Realtime while
the workflow executes. No polling.

**Encrypted credentials** — API keys are encrypted at rest with AES before they touch the
database, and decrypted only inside the executor that needs them.

**Execution history** — Every run is recorded with its status, output, and full error
stack for debugging.

### Nodes

| Triggers | Actions |
| --- | --- |
| Manual | HTTP Request |
| Google Form | OpenAI |
| Stripe | Anthropic |
| | Google Gemini |
| | Discord |
| | Slack |

---

## Tech stack

| | |
| --- | --- |
| Framework | Next.js 15 (App Router, Turbopack) |
| Language | TypeScript |
| API | tRPC v11 + TanStack Query |
| Database | PostgreSQL (Supabase) via Prisma 7 |
| Background jobs | Inngest + Inngest Realtime |
| Auth | Better Auth (email/password, GitHub, Google) |
| Billing | Polar |
| AI | Vercel AI SDK (OpenAI, Anthropic, Gemini) |
| Canvas | React Flow (`@xyflow/react`) |
| UI | Tailwind CSS + shadcn/ui |
| Monitoring | Sentry |

---

## How it works

1. A trigger fires — someone clicks **Execute**, a Google Form is submitted, or Stripe
   sends an event. Webhooks arrive at `/api/webhooks/:provider?workflowId=...`.
2. The handler sends a `workflows/execute.workflow` event to Inngest and returns
   immediately.
3. The Inngest function loads the workflow, then **topologically sorts** the graph so
   every node runs after its dependencies. Cycles are rejected up front.
4. Each node runs as its own `step.run`, looking up its implementation in the
   [executor registry](src/features/executions/lib/executor-registry.ts). Output from
   upstream nodes is passed down the graph.
5. Status updates publish to an Inngest Realtime channel, which the editor subscribes to.
6. The final result and status are written back to the `Execution` record.

---

## Getting started

See **[SETUP.md](SETUP.md)** for the full walkthrough — external service setup, every
environment variable, and deployment notes.

The short version:

```bash
git clone https://github.com/OmMaheshwari653/flowhub.git
cd flowhub
npm install              # runs `prisma generate` via postinstall
cp .env.example .env     # then fill it in
npx prisma migrate dev
```

Then run both processes, each in its own terminal:

```bash
npm run dev                      # Next.js  -> http://localhost:3000
npx inngest-cli@latest dev       # Inngest  -> http://localhost:8288
```

The Inngest dev server is required. Without it, clicking **Execute** does nothing.

---

## Project structure

```
prisma/schema.prisma        Database schema
src/
  app/                      Routes — (auth), (dashboard), api/
    api/inngest/route.ts    Serves the Inngest function
    api/webhooks/           Google Form + Stripe entry points
  features/                 Feature modules, each self-contained
    credentials/            Encrypted API key storage
    editor/                 React Flow canvas
    executions/             Action nodes + their executors
    triggers/               Trigger nodes
    workflows/              Workflow CRUD
    subscriptions/          Polar billing
  inngest/
    function.ts             The workflow engine
    utils.ts                Topological sort + event dispatch
    channels/               Realtime channels, one per node type
  lib/                      db, auth, encryption
  trpc/                     tRPC setup and root router
```

Each node type lives in one folder containing its canvas component (`node.tsx`), its
config dialog (`dialog.tsx`), its server actions (`actions.ts`), and its runtime
(`executor.ts`).

### Adding a node

1. Add the variant to the `NodeType` enum in `prisma/schema.prisma`, then migrate.
2. Create a folder under `src/features/executions/components/`.
3. Implement `executor.ts` against the `NodeExecutor` interface.
4. Register it in `executor-registry.ts`.
5. Add a Realtime channel in `src/inngest/channels/` and list it on the Inngest function.

---

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Dev server with Turbopack |
| `npm run build` | `prisma generate` then a production build |
| `npm start` | Serve the production build |
| `npm run lint` | Biome check |
| `npm run format` | Biome format |

---

## License

Not currently licensed for reuse. All rights reserved.
