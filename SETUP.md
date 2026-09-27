# Setup Guide

Everything needed to run FlowHub locally and deploy it.

- [Prerequisites](#prerequisites)
- [Local setup](#local-setup)
- [Environment variables](#environment-variables)
- [External services](#external-services)
- [Connecting triggers](#connecting-triggers)
- [Deploying](#deploying)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

- **Node.js 20+** (developed on 22.14)
- **npm**
- A **PostgreSQL** database — [Supabase](https://supabase.com) free tier works
- An **[Inngest](https://www.inngest.com)** account (only for deployment; local uses the CLI)

---

## Local setup

**1. Clone and install**

```bash
git clone https://github.com/OmMaheshwari653/flowhub.git
cd flowhub
npm install
```

`npm install` triggers `prisma generate` through the `postinstall` script, which writes
the Prisma client to `src/generated/prisma`. That folder is gitignored and regenerated on
every install — never edit or commit it.

**2. Configure the environment**

```bash
cp .env.example .env
```

Fill in the values. At minimum you need `DATABASE_URL`, `DIRECT_URL`,
`BETTER_AUTH_SECRET`, and `ENCRYPTION_KEY` for the app to boot. Generate the two secrets:

```bash
openssl rand -base64 32
```

**3. Set up the database**

```bash
npx prisma migrate dev
```

**4. Run it**

Two processes, each in its own terminal. Both are required.

```bash
npm run dev                     # Next.js  -> http://localhost:3000
```

```bash
npx inngest-cli@latest dev      # Inngest  -> http://localhost:8288
```

The Inngest dev server discovers the app at `/api/inngest` and executes workflows. If it
isn't running, clicking **Execute** appears to do nothing — the event is sent but nothing
picks it up.

Open <http://localhost:3000>, create an account, and build a workflow. Watch runs land in
the Inngest dashboard at <http://localhost:8288>.

---

## Environment variables

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Pooled connection, port 6543 |
| `DIRECT_URL` | Yes | Direct connection, port 5432. Used by migrations |
| `PRISMA_SCHEMA_DISABLE_ADVISORY_LOCK` | Yes | Set to `true`. Supabase's pooler doesn't support advisory locks |
| `NEXT_PUBLIC_APP_URL` | Production | Public base URL. See the warning below |
| `BETTER_AUTH_SECRET` | Yes | Random 32-byte secret |
| `BETTER_AUTH_URL` | Yes | Base URL of the app |
| `ENCRYPTION_KEY` | Yes | Encrypts stored credentials. See the warning below |
| `GITHUB_CLIENT_ID` / `_SECRET` | Optional | Enables GitHub sign-in |
| `GOOGLE_CLIENT_ID` / `_SECRET` | Optional | Enables Google sign-in |
| `INNGEST_DEV` | Local only | Set to `1` locally. **Never set in production** |
| `INNGEST_EVENT_KEY` | Production | From Inngest Cloud |
| `INNGEST_SIGNING_KEY` | Production | From Inngest Cloud. Realtime needs it too |
| `POLAR_ACCESS_TOKEN` | Optional | Billing |
| `POLAR_SUCCESS_URL` | Optional | Where checkout redirects after payment |
| `SENTRY_AUTH_TOKEN` | Optional | Source map upload at build time |

> **`ENCRYPTION_KEY` is permanent.** Every stored credential is encrypted with it. If you
> change or lose it, existing credentials can never be decrypted and every user has to
> re-enter their API keys. Back it up.

> **`NEXT_PUBLIC_APP_URL` must be set in production.** The Google Form and Stripe trigger
> dialogs build the webhook URL they show users from this variable, falling back to
> `http://localhost:3000`. If it's unset in production, users copy a localhost URL and
> their triggers silently never fire.

> `NEXT_PUBLIC_*` variables are baked in at build time. Changing one requires a redeploy —
> saving it in your host's dashboard is not enough.

---

## External services

### Supabase

Create a project, then open **Connect → ORMs → Prisma**. Copy both connection strings and
replace `[YOUR-PASSWORD]` with your database password.

### GitHub OAuth

**Settings → Developer settings → OAuth Apps → New OAuth App**

- Homepage URL: `http://localhost:3000`
- Authorization callback URL: `http://localhost:3000/api/auth/callback/github`

Add a separate app (or a second callback URL) for your production domain.

### Google OAuth

**Google Cloud Console → APIs & Services → Credentials → OAuth client ID → Web application**

- Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

### Inngest (production only)

1. Create an app at <https://app.inngest.com>.
2. **Manage → Keys** — copy the Event Key and Signing Key into your environment.
3. After deploying, **Apps → Sync new app** and enter
   `https://your-domain.com/api/inngest`.

Step 3 is not optional. Until you sync, Inngest Cloud has no idea the `execute-workflow`
function exists and every run is dropped.

### Polar (optional)

Create an organization and a product, then copy the access token. The product ID is
currently hardcoded in [src/lib/auth.ts](src/lib/auth.ts) — change it to yours.

---

## Connecting triggers

Both webhook triggers expect the target workflow in the query string:

```
POST /api/webhooks/google-form?workflowId=<id>
POST /api/webhooks/stripe?workflowId=<id>
```

Open the trigger node's dialog in the editor to copy the exact URL.

**Google Form** — Extensions → Apps Script on the form, add an `onFormSubmit` trigger, and
`POST` the response payload to the webhook URL.

**Stripe** — Dashboard → Developers → Webhooks → Add endpoint. Paste the URL and pick the
events you want.

> Neither webhook verifies signatures. Anyone who learns the URL can trigger a run.
> Treat these URLs as secrets, and add signature verification before handling anything
> sensitive.

---

## Deploying

FlowHub is built for Vercel, but any Node host works.

**1. Environment variables.** Add every variable from your `.env` to the host's dashboard.
`.env` is gitignored and never deployed. Add them *before* the first build — pages
prerender at build time and a missing `DATABASE_URL` fails the build, not the runtime.

**2. Omit `INNGEST_DEV`.** Do not carry it over. If set, the SDK looks for a dev server on
localhost and workflows silently never execute.

**3. Update URLs for your domain:**

- `NEXT_PUBLIC_APP_URL` and `BETTER_AUTH_URL` → your production domain
- `POLAR_SUCCESS_URL` → your production domain
- Add the production callback URLs to the GitHub and Google OAuth consoles

**4. Run migrations** against the production database:

```bash
DIRECT_URL="<production direct url>" npx prisma migrate deploy
```

The build does not do this for you.

**5. Sync the Inngest app** — see [Inngest](#inngest-production-only) above.

The build command already runs `prisma generate`, so no extra host configuration is
needed.

---

## Troubleshooting

**`Module not found: Can't resolve '@/generated/prisma'`**

The Prisma client hasn't been generated, or something imports the bare directory. Prisma
7's `prisma-client` generator emits `client.ts`, `browser.ts`, and `enums.ts` — there is
no `index.ts`, so `@/generated/prisma` does not resolve. Import from the right entry
point:

- `@/generated/prisma/client` — server-side, includes `PrismaClient`
- `@/generated/prisma/browser` — types and enums only, safe in client components

Note that `prisma generate` does not clean its output directory, so a stale `index.ts`
from an older version can survive locally and mask this until you deploy.

**Clicking Execute does nothing**

The Inngest dev server isn't running locally, or in production `INNGEST_DEV` is set, the
keys are missing, or the app was never synced.

**Migrations hang on Supabase**

Set `PRISMA_SCHEMA_DISABLE_ADVISORY_LOCK=true` and make sure `DIRECT_URL` uses port 5432,
not the pooler.

**Credentials fail to decrypt**

`ENCRYPTION_KEY` changed. There is no recovery — the affected credentials must be
re-entered.
