# Promodo App — Project Plan

## Context

This is a university thesis project consisting of an Android app (React Native, exported as `.apk`), a Node.js web API deployed to an Oracle Cloud VPS (Ubuntu), and a PostgreSQL database. The goal of this initial pass is **not** to build the full feature set, but to lay down a solid, extensible scaffold:

- A real, working Login flow (email/password with forgot-password + create-account, plus Google OAuth as an alternative) since auth is foundational and used to gate everything else.
- Three placeholder pages (Pomodoro, Todo List, Self Quiz) with no real logic yet — just navigable screens.
- A repo structure and set of conventions that make it easy to add new pages/modules later, since more pages are planned.
- Clean separation between **local development** and **production** environments, since the app needs to run against a local Postgres/API during development and against the real Oracle VPS + production Postgres once deployed.

Locked-in decisions: monorepo (`/mobile` + `/server`), Expo (managed workflow, TypeScript, EAS Build for the `.apk`), Express + Prisma + TypeScript backend, email/password + Google OAuth auth.

---

## Environments: local dev vs. production

Treated as a first-class concern throughout, not an afterthought:

- **Server**: `server/.env` is never committed. Two example files are provided — `server/.env.development.example` (points at a local Docker Postgres, `SMTP_*` blank so emails log to console, permissive `CORS_ORIGIN`) and `server/.env.production.example` (points at the VPS's local Postgres, real SMTP creds, real `JWT_SECRET`, restricted CORS). Setting up either environment is "copy the matching example to `.env` and fill in secrets."
- **Database**: local dev uses a Dockerized Postgres (`server/docker-compose.yml`, dev-only). Production uses Postgres installed natively on the Ubuntu VPS. Same Prisma schema/migrations apply to both via `prisma migrate dev` (local) and `prisma migrate deploy` (prod).
- **Mobile**: `mobile/.env` (gitignored, local dev — API base URL points at the emulator alias `10.0.2.2` or a LAN IP) vs. `mobile/eas.json` build profiles, which inject `EXPO_PUBLIC_API_BASE_URL` pointing at the real VPS domain for `preview`/`production` build profiles. So switching environments for mobile is "which command you run" (`expo start` vs `eas build --profile production`), not a manual file edit.
- **Backend code** reads config through a single `src/config/env.ts` (zod-validated), so `NODE_ENV` and the rest of the app never branch on environment directly — only the `.env` contents differ.

---

## Extensibility: adding future pages/modules

Every future page follows the same two-sided pattern:

- **Backend**: a new folder under `server/src/modules/<name>/` (routes/controller/service/validation), registered once in `server/src/routes/index.ts`.
- **Mobile**: a new folder under `mobile/src/features/<name>/screens/`, registered once as a tab/stack entry in `mobile/src/navigation/MainNavigator.tsx`.

The three placeholder pages (Pomodoro, Todo List, Self Quiz) are built using this exact pattern now — including trivial authenticated backend stub routes — specifically so the pattern is proven end-to-end before any real feature is built on top of it. Both `server/README.md` and `mobile/README.md` document this convention explicitly ("to add a new page, do X").

---

## Theming: single source of truth for styling

Visual design/branding hasn't been decided yet, so the scaffold picks one sensible default now and — critically — structures the app so it can be swapped later by editing **one file**, not hunting through every screen.

- **File**: `mobile/src/theme/theme.ts` — the only place raw color/spacing/typography values are allowed to live. Every screen and component imports from it (`import { theme } from '@/theme'` via a `@/*` path alias in `tsconfig.json`) and references `theme.colors.primary` etc. — never a hardcoded hex value. This is enforced as a convention (documented in `mobile/README.md`), not by tooling, for scaffold simplicity.
- **Shape**: a single exported object grouping `colors`, `spacing`, `radius`, and `typography` (font sizes/weights), so `theme.ts` is genuinely the one file to touch — not just colors, but the general look-and-feel knobs.
  ```ts
  export const theme = {
    colors: { primary, primaryDark, secondary, background, surface,
      textPrimary, textSecondary, border, success, error, warning },
    spacing: { xs, sm, md, lg, xl },     // 4/8/16/24/32
    radius: { sm, md, lg },              // 6/12/20
    typography: { h1, h2, body, caption },
  };
  ```
- **Default palette (decided now, easy to revisit)** — tomato/coral as the primary, tying back to "Promodo"/Pomodoro branding, kept intentionally simple (no dark-mode variants yet, but the single-object shape means adding a `darkTheme` export later is additive, not a rewrite):
  - `primary` `#FF6B57` (coral/tomato) — buttons, active tab, links
  - `primaryDark` `#E6503D` — pressed states
  - `secondary` `#4ECDC4` (teal) — secondary accents, future module variety
  - `background` `#FFFFFF`, `surface` `#F7F7F9` (cards/inputs)
  - `textPrimary` `#1A1A2E`, `textSecondary` `#6B7280`
  - `border` `#E5E7EB`
  - `success` `#2DBE60`, `error` `#E63946`, `warning` `#F4A261`
- Applies immediately to the Login/CreateAccount/ForgotPassword/ResetPassword screens and the shared `PlaceholderScreen` component, so the whole app is visually consistent from the first commit even though no page has "real" design work yet.

---

## Repo layout

```
promodo-app/
├── .gitignore
├── .editorconfig
├── .nvmrc                  # "20"
├── README.md                # overview + env setup + links to mobile/server/deploy docs
├── plan.md                  # this file
├── mobile/                  # Expo React Native app (TypeScript)
├── server/                  # Express + Prisma API (TypeScript)
└── deploy/                  # deployment configs/docs for the Oracle VPS
```

No root npm workspaces — `mobile/` and `server/` are independently installed (`cd mobile && npm install`, `cd server && npm install`). Avoids Expo/Metro monorepo hoisting friction for minimal benefit in a 2-project thesis repo.

`.gitignore` covers `node_modules/`, `.env*` (except `*.example`), `dist/`, `.expo/`, `android/`, `ios/`, `*.apk`, `*.aab`, `*.log`.

---

## Server scaffold (`/server`)

```
server/
├── package.json / tsconfig.json
├── .env.development.example
├── .env.production.example
├── docker-compose.yml        # local Postgres only (dev)
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── index.ts               # entrypoint
│   ├── app.ts                 # express() assembly
│   ├── config/env.ts          # zod-validated env
│   ├── lib/{prisma,mailer,jwt,errors}.ts
│   ├── middleware/{requireAuth,errorHandler,notFound,authRateLimiter}.ts
│   ├── modules/
│   │   ├── auth/   (routes, controller, service, validation, google.ts)
│   │   ├── user/   (GET /me)
│   │   ├── pomodoro/  (stub route)
│   │   ├── todo/      (stub route)
│   │   └── quiz/      (stub route)
│   └── routes/index.ts        # mounts all module routers under /api
└── README.md
```

**Prisma `User` model** — supports both auth methods on one table (nullable `passwordHash` / `googleId`, no separate provider enum):

```prisma
model User {
  id                String    @id @default(uuid())
  email             String    @unique
  name              String?
  passwordHash      String?
  googleId          String?   @unique
  resetTokenHash    String?
  resetTokenExpiry  DateTime?
  resetAttempts     Int       @default(0)
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}
```

**Routes**:
| Method | Path | Notes |
|---|---|---|
| POST | `/api/auth/register` | email/password/name → JWT + user |
| POST | `/api/auth/login` | email/password → JWT + user |
| POST | `/api/auth/forgot-password` | email → generic 200, sends 6-digit code if password account exists (no enumeration) |
| POST | `/api/auth/reset-password` | email/code/newPassword → validates hash+expiry+attempts |
| POST | `/api/auth/google` | idToken → verified via google-auth-library, find-or-create, JWT |
| GET | `/api/users/me` | requires auth |
| GET | `/api/pomodoro`, `/api/todo`, `/api/quiz` | stub, requires auth, "coming soon" |

**Forgot-password design** (mobile-appropriate, no browser page): 6-digit code, bcrypt-hashed at rest, 15-min expiry, capped attempts. Emailed via nodemailer (`SMTP_*` env); if `SMTP_HOST` is unset (local dev), the mailer logs the code to console instead — no external email service needed for local dev/testing. User enters code + new password in-app (`ResetPasswordScreen`).

**Middleware**: `helmet`, `cors` (env-driven origin), `express-rate-limit` (tighter limits on `/forgot-password` and `/reset-password`), `requireAuth` (JWT guard), `errorHandler`/`notFound`.

**JWT**: single long-lived access token (`JWT_EXPIRES_IN=30d`), stored in `expo-secure-store` on device. No refresh-token rotation — explicit v1 simplification, documented as a known limitation.

---

## Mobile scaffold (`/mobile`)

```
mobile/
├── app.config.ts / eas.json / .env.example
├── src/
│   ├── App.tsx
│   ├── navigation/
│   │   ├── RootNavigator.tsx   # single NavigationContainer, Auth vs Main based on AuthContext
│   │   ├── AuthNavigator.tsx    # stack: Login, CreateAccount, ForgotPassword, ResetPassword
│   │   └── MainNavigator.tsx    # bottom tabs: Pomodoro, TodoList, SelfQuiz
│   ├── features/
│   │   ├── auth/ (screens/, api.ts, AuthContext.tsx, useGoogleAuth.ts)
│   │   ├── pomodoro/screens/PomodoroScreen.tsx
│   │   ├── todo/screens/TodoListScreen.tsx
│   │   └── quiz/screens/SelfQuizScreen.tsx
│   ├── api/client.ts            # axios + auth header interceptor + 401 handling
│   ├── components/PlaceholderScreen.tsx   # shared "<Title> — Coming soon"
│   ├── theme/theme.ts            # single source of truth: colors/spacing/radius/typography
│   └── storage/secureStore.ts   # token get/set/clear
└── README.md
```

- **Navigation**: React Navigation v6 (native-stack + bottom-tabs). `RootNavigator` swaps `AuthNavigator` ↔ `MainNavigator` based on `AuthContext`'s `isAuthenticated`/`isLoading`.
- **Auth state**: `AuthContext` reads/writes the JWT via `expo-secure-store`; validates on cold start via `GET /me`.
- **API base URL**: Expo's native `EXPO_PUBLIC_*` env var support. Local dev via `mobile/.env` (`10.0.2.2` for emulator, or LAN IP for physical device — both documented since `localhost` won't resolve from a device). Prod via `eas.json` build-profile `env` blocks pointing at the real VPS domain.
- **Google OAuth**: `expo-auth-session` (not `@react-native-google-signin`) — pure JS, works in Expo Go, no native config-plugin complexity, fits the managed-workflow + EAS Build pipeline. Requires Google Cloud Console setup (Android + Web OAuth client IDs); documented step-by-step in `mobile/README.md`, including the caveat that full native-flow testing is more reliable via an EAS `development` build than plain Expo Go.
- **Placeholder screens**: each of the 3 pages renders a single shared `<PlaceholderScreen title="..." />` component (title + "Coming soon"), styled entirely from `theme/theme.ts`. Swapping in a real feature later is a one-file change; swapping the color scheme later is also a one-file change.

---

## Deployment scaffold (`/deploy`)

Repo files/docs only (no VPS access to execute against):

- `deploy/ecosystem.config.js` — PM2 config running `server/dist/index.js`; secrets stay in the VPS's own `server/.env`, never in this file.
- `deploy/nginx.conf.example` — reverse proxy `:443 → localhost:4000`, certbot TLS paths, forwarded headers.
- `deploy/DEPLOY.md` — manual steps: install Node (matching `.nvmrc`)/Postgres/nginx/certbot/pm2 on Ubuntu → create DB/role → clone repo → `server/.env` from `.env.production.example` → `prisma migrate deploy` → `npm run build` → `pm2 start` → nginx site + certbot → redeploy procedure (`git pull` → `npm ci` → `migrate deploy` → `build` → `pm2 restart`).

---

## EAS build (`.apk` output)

`mobile/eas.json` profiles (`development`, `preview`, `production`) each set `"android": { "buildType": "apk" }` explicitly — EAS's default production build is an `.aab` (Play Store bundle), and the requirement here is a directly installable `.apk`. `preview`/`production` profiles also set `env.EXPO_PUBLIC_API_BASE_URL` to the real VPS domain.

---

## Command sequence to initialize

```bash
mkdir mobile server deploy

# server
cd server
npm init -y
npm install express cors helmet dotenv bcrypt jsonwebtoken zod express-rate-limit nodemailer google-auth-library @prisma/client
npm install -D typescript ts-node-dev @types/node @types/express @types/cors @types/bcrypt @types/jsonwebtoken prisma
npx tsc --init
npx prisma init --datasource-provider postgresql

# mobile
cd ../mobile
npx create-expo-app@latest . --template blank-typescript
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs axios
npx expo install react-native-screens react-native-safe-area-context react-native-gesture-handler expo-secure-store expo-auth-session expo-web-browser expo-crypto
npx eas login
npx eas build:configure
```

---

## Verification (local, before touching the VPS)

1. `server`: `docker compose up -d` → local Postgres.
2. Copy `.env.development.example` → `.env`, fill `DATABASE_URL`/generate `JWT_SECRET`, leave `SMTP_*` blank.
3. `npx prisma migrate dev --name init`, `npm run dev` → API on `:4000`.
4. Curl smoke test in order: register → login → `GET /me` → forgot-password (read code from console log) → reset-password → login with new password → `GET /pomodoro` (authed).
5. `mobile`: fill `.env` with `EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:4000` (emulator) or LAN IP (device). `npx expo start`.
6. Exercise in Expo Go/emulator: Create Account → lands on 3-tab main nav → Sign Out → Login → Forgot Password → Reset Password, all against the local server.
7. Google Sign-In: verify Console client IDs are wired; full native-flow check may need an EAS `development` build rather than plain Expo Go (documented caveat, not a blocker).
8. Build a real `.apk`: `eas build --profile preview --platform android`, install on a device, retest against local/LAN backend.
9. Only after 1–8 pass, execute `deploy/DEPLOY.md` against the actual Oracle VPS, then point `eas.json`'s `production` profile env at the live domain and cut a `production` `.apk`.

---

## Critical files
- `server/prisma/schema.prisma`
- `server/src/modules/auth/auth.service.ts`
- `server/src/routes/index.ts`
- `server/src/config/env.ts`
- `mobile/src/navigation/RootNavigator.tsx`
- `mobile/src/features/auth/AuthContext.tsx`
- `mobile/src/theme/theme.ts`
- `mobile/eas.json`
- `deploy/DEPLOY.md`
