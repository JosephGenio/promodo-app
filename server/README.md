# StudyMate — Server

Express + Prisma (PostgreSQL) API. Implements email/password register, login, and forgot/reset-password so far — see [plan.md](../plan.md) for the fuller design (Google OAuth, feature module stubs) that hasn't been built yet.

## Setup

```bash
npm install
docker compose up -d          # local Postgres (see docker-compose.yml)
cp .env.development.example .env
```

Edit `.env`:
- `DATABASE_URL` — already matches `docker-compose.yml`'s credentials, no change needed for local dev.
- `JWT_SECRET` — generate a real one: `openssl rand -hex 32`.

`docker-compose.yml` uses port **5434** (not Postgres's default 5432) and an explicit project name (`studymate-server`, so containers are `studymate-server-postgres-1` etc.) — this machine already runs Postgres containers for other projects on 5432/5433, and a generic `server-*` container name would be ambiguous alongside them.

```bash
npx prisma migrate dev --name init   # creates the User table
npm run dev                           # API on :4000
```

## Project structure

```
docker-compose.yml     # local-dev-only Postgres (project name "studymate-server")
deploy/                # production deploy docs/config — see deploy/DEPLOY.md
prisma/
├── schema.prisma       # User model
└── migrations/
prisma.config.ts         # Prisma CLI config (schema path, migrations path, DATABASE_URL) — Prisma 7 no longer
                            reads DATABASE_URL from schema.prisma or auto-loads .env; this file does both explicitly
src/
├── index.ts              # entrypoint — starts the HTTP server
├── app.ts                  # express() assembly: middleware + route mounting
├── config/env.ts             # zod-validated process.env → typed config
├── lib/
│   ├── prisma.ts               # PrismaClient singleton (via @prisma/adapter-pg — see note below)
│   ├── jwt.ts                    # sign/verify helpers
│   ├── mailer.ts                   # sendPasswordResetEmail — nodemailer, or console.log if SMTP unset
│   └── errors.ts                     # AppError + helpers (conflict/unauthorized/badRequest/notFound)
├── middleware/
│   ├── requireAuth.ts               # JWT guard, attaches req.userId
│   ├── errorHandler.ts                # formats AppError / ZodError / unknown errors as JSON
│   ├── notFound.ts                      # 404 catch-all
│   ├── authRateLimiter.ts                 # rate limit on all of /api/auth/*
│   └── passwordResetRateLimiter.ts          # tighter limit specifically on forgot/reset-password
├── modules/
│   ├── auth/                                # register, login, forgot/reset-password (validation/service/controller/routes)
│   └── user/                                  # GET /me
└── routes/index.ts                              # mounts module routers under /api
```

**Adding a new module**: copy `modules/auth/` as a template (routes → controller → service → validation), register the router in `routes/index.ts`.

## Routes implemented so far

| Method | Path | Notes |
|---|---|---|
| GET | `/health` | liveness check |
| POST | `/api/auth/register` | `{ email, password, name? }` → `201 { token, user }` |
| POST | `/api/auth/login` | `{ email, password }` → `200 { token, user }` |
| POST | `/api/auth/forgot-password` | `{ email }` → `200 { message }` (always the same generic message — see below) |
| POST | `/api/auth/reset-password` | `{ email, code, newPassword }` → `200 { message }` |
| GET | `/api/users/me` | requires `Authorization: Bearer <token>` → current user |

Not yet implemented (see `plan.md`): Google OAuth (`POST /api/auth/google`), and the pomodoro/todo/quiz stub routes.

### Forgot/reset-password design

- `POST /forgot-password` always returns the same generic message regardless of whether the email exists, and regardless of whether the code-send step ran — this prevents the endpoint being used to enumerate registered emails.
- If the account exists, a 6-digit code (`crypto.randomInt`, not `Math.random`) is generated, **bcrypt-hashed** before being stored (`resetTokenHash`/`resetTokenExpiry`/`resetAttempts` on `User`), and emailed via `lib/mailer.ts`.
- **Local dev**: leave `SMTP_HOST` blank in `.env` — `lib/mailer.ts` logs the code to the server's own console instead of sending an email, so you can copy it from there to test the flow with zero email setup.
- **Production**: `SMTP_HOST`/`SMTP_USER`/`SMTP_PASS` must be set in `.env` (any standard SMTP provider), or reset codes will only ever reach `pm2 logs studymate-backend`, never the user's inbox.
- `POST /reset-password` checks the code against the stored hash, a 15-minute expiry (`RESET_CODE_EXPIRY_MINUTES`), and caps wrong attempts at 5 (`resetAttempts`) before requiring a fresh code. Both `/forgot-password` and `/reset-password` also sit behind a tighter rate limit (`passwordResetRateLimiter`, 5 req/15min) than the rest of `/api/auth/*`, since a 6-digit code is brute-forceable.

## Notable deviation from `plan.md`: Prisma 7

`plan.md` was written assuming the classic Prisma pattern (`datasource db { url = env("DATABASE_URL") }`, `new PrismaClient()` with no args). The installed version is **Prisma 7**, which changed this:

- `prisma/schema.prisma`'s `datasource` block no longer holds the connection URL — the **Prisma CLI** (`migrate`, `generate`, `studio`) now reads it from `prisma.config.ts` instead (which itself loads `.env` via `dotenv/config`).
- The generator is `"prisma-client"` (not `"prisma-client-js"`), and it generates a full TS client into `src/generated/prisma/` (gitignored, regenerated via `npm run prisma:generate` — also runs automatically after `prisma migrate dev`).
- The **runtime client** (`new PrismaClient()`) requires an explicit driver adapter — it does not read `DATABASE_URL` on its own. `src/lib/prisma.ts` passes one explicitly via `@prisma/adapter-pg`, reading the URL from our own validated `env.DATABASE_URL` (`src/config/env.ts`), not straight from `process.env`.

Also: the `User` model only has `passwordHash` (required) and the reset-token fields for now — no `googleId` yet. That gets added via a new migration when Google Sign-In is implemented, rather than speculatively now.

## Verifying locally

With the server running (`npm run dev`) and Postgres up:

```bash
curl -s -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# copy the "token" from either response
curl -s http://localhost:4000/api/users/me -H "Authorization: Bearer <token>"

# Forgot/reset password — with SMTP_HOST unset, watch the `npm run dev`
# terminal for a line like:
#   [mailer] SMTP not configured — password reset code for test@example.com: 123456
curl -s -X POST http://localhost:4000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

curl -s -X POST http://localhost:4000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","code":"<code from the console log>","newPassword":"newpassword123"}'
```

## Connecting the mobile app

In `mobile/.env`, set `EXPO_PUBLIC_API_BASE_URL` to reach this server:
- Android emulator: `http://10.0.2.2:4000` (already the default)
- Physical device on the same Wi-Fi: `http://<your-machine's-LAN-IP>:4000`

And set `EXPO_PUBLIC_DEV_SKIP_AUTH=false` so the app actually exercises the login/register screens against this server instead of bypassing auth.

## Deploying to production

See [deploy/DEPLOY.md](deploy/DEPLOY.md). Short version: this VPS also hosts the `bnhs-character-self-assessment` backend (PM2 `bnhs-char-assessment-backend`, port 4000, `bnhs-api.synflo.space`), so StudyMate's production server deliberately uses a **different port (4001)** and subdomain (`studymate-api.synflo.space`) — see `.env.production.example` and `deploy/nginx.conf.example`. Postgres role/db are also separate (`studymate_app`/`studymate`, not the sibling project's `bnhs_app`/`bnhs_char_assessment`).
