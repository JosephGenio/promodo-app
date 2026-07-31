# StudyMate — Mobile

Expo (managed workflow, TypeScript) React Native app. Requires the `server` API running (locally or deployed) to actually log in — see the root [README](../README.md) and [plan.md](../plan.md).

## Setup

```bash
npm install
cp .env.example .env
```

Edit `.env`:
- `EXPO_PUBLIC_API_BASE_URL` — `http://10.0.2.2:4000` works from the Android emulator to reach a server running on your machine. From a physical device on the same Wi-Fi, use your machine's LAN IP instead (`localhost`/`10.0.2.2` will not resolve from a device).
- `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` / `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` — from Google Cloud Console, see below. The app runs fine without these; "Continue with Google" just won't authenticate until they're set.

```bash
npx expo start
```

### Previewing screens before the backend exists

There's no `server/` yet, so real login/register calls will fail with a network error — that's expected. To preview the main app without a backend, set `EXPO_PUBLIC_DEV_SKIP_AUTH=true` in `.env` and restart `expo start`. This skips the login screen with a fake local user. Turn it back off (or remove it) once the backend is up so you're testing real auth.

## Project structure

Navigation is a single bottom-tab navigator (`MainTabNavigator`). Home, Timer, Tasks, Notes, and Profile show a tab bar button; the rest are registered as tabs with their button hidden (`tabBarButton: () => null`) so the same bottom bar stays visible everywhere — reached via cards on Home or links on Profile, not a stack push (no screen shows a back arrow, matching the reference design).

```
src/
├── navigation/       # RootNavigator (auth vs main), AuthNavigator, MainTabNavigator, types.ts
├── features/
│   ├── auth/          # Login, CreateAccount, ForgotPassword, ResetPassword, AuthContext
│   ├── home/           # dashboard: quick stats + feature grid linking to the tabs below
│   ├── pomodoro/        # Timer tab — Study/Short Break/Long Break, session tracking
│   ├── todo/             # Tasks tab — Active/Done/All, add/edit/delete
│   ├── notes/             # Notes tab — search, category filters, add note
│   ├── profile/            # Profile tab — stats, sign out, link to Progress Tracker
│   ├── reflection/          # Daily Reflection (hidden tab)
│   ├── mood/                 # Mood & Energy (hidden tab)
│   ├── progress/               # Progress Tracker (hidden tab)
│   ├── quiz/                    # Self-Quiz Maker + Take Quiz (hidden tabs), quizStore.tsx (shared quiz state)
│   ├── planner/                   # Study Planner (hidden tab)
│   ├── goals/                      # Weekly Goals (hidden tab)
│   ├── reminders/                   # Daily Reminder — placeholder, no mockup yet
│   ├── exams/                         # Exam Countdown — placeholder, no mockup yet
│   └── achievements/                   # Achievement Badges — placeholder, no mockup yet
├── api/               # axios client, 401 handling, error helper
├── storage/            # secure token storage
├── components/          # shared UI: ScreenHeader, ScreenContainer, SectionCard, StatCard,
│                          TagPill, ProgressBar, StarRating, Pill, GradientButton, etc.
└── theme/                # theme.ts — single source of truth for styling
```

All of the above except auth screens are frontend-only right now: state lives in local component state (or `quizStore`'s React Context for quizzes), nothing persists across an app reload or talks to `server/` yet.

### Adding a new page

1. Create `src/features/<name>/screens/<Name>Screen.tsx`, built from the shared components in `src/components/`.
2. Add it to `MainTabParamList` in `src/navigation/types.ts`.
3. Register it in `src/navigation/MainTabNavigator.tsx` — give it a visible tab bar button, or pass `options={hiddenTabOptions}` to keep it reachable only via `navigation.navigate(...)` from another screen (e.g. a Home card).
4. Style it using `theme` from `src/theme/theme.ts` — don't hardcode colors/spacing.

### Theming

All colors, spacing, radii, and typography live in `src/theme/theme.ts`. To change the app's look, edit that one file — every screen reads from `theme.colors.*` etc. rather than hardcoded values.

## Google Sign-In setup

1. Create a project in [Google Cloud Console](https://console.cloud.google.com/).
2. Configure the OAuth consent screen (External, Testing mode is enough for a thesis demo).
3. Create an OAuth Client ID of type **Android** — needs the package name (`com.thesis.promodoapp`, see `app.config.ts`) and a SHA-1 fingerprint (debug keystore for Expo Go/dev testing, or `eas credentials` for the EAS-managed release keystore).
4. Create an OAuth Client ID of type **Web application** — used both as the backend's token-verification audience and by `expo-auth-session`'s redirect flow.
5. Put both IDs into `.env` (`EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID` / `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`) and into the server's `.env` (`GOOGLE_ANDROID_CLIENT_ID` / `GOOGLE_WEB_CLIENT_ID`).
6. Testing on iOS via Expo Go (dev convenience only — the app ships as an Android `.apk`, there's no iOS build target): also create an **iOS** OAuth Client ID and set `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` in `.env`, or the Google button will just fail to authenticate on iOS (it won't crash — all three client ID fields default to an empty string, and `expo-auth-session` only throws if a field is left `undefined`).

**Caveat**: full native Google Sign-In may not work reliably in plain Expo Go — it's more reliably tested via an EAS `development` build (`eas build --profile development --platform android`). Email/password auth works fully in Expo Go regardless.

## Building the `.apk`

```bash
npx eas-cli login
npx eas-cli build:configure   # first time only, sets extra.eas.projectId
npx eas-cli build --profile preview --platform android
```

Use `npx eas-cli ...`, not `npx eas ...` — the npm package is named `eas-cli` (its binary is `eas`), and bare `npx eas ...` can't resolve that mismatch. Don't add `eas-cli` as a project dependency either (`expo-doctor` flags it) — `npx eas-cli` fetches it on demand.

`eas.json` profiles all set `android.buildType: "apk"` explicitly (EAS's default production build is a Play Store `.aab`, not an installable `.apk`). Update the `EXPO_PUBLIC_API_BASE_URL` in the `preview`/`production` profiles once the real VPS domain is known.
