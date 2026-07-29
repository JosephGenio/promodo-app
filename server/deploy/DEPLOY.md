# Backend Deployment Guide

Target: the same Linux VPS (Oracle Cloud free tier, host `synflo-prod-vnic`)
that already hosts the `bnhs-character-self-assessment` backend and an
unrelated `n8n` instance — see the notes throughout this guide on what to
keep distinct from those so all three coexist.

The API lives on its own subdomain, **`studymate-api.synflo.space`**, and
its own port, **4001** — the bnhs sibling project already owns port 4000
and `bnhs-api.synflo.space` on this box; `n8n` owns `n8n.synflo.space`.

Unlike `bnhs-character-self-assessment` (separate Vercel-hosted frontends
calling the API over HTTPS), StudyMate's only client is the mobile app, so
there's no separate frontend-domain/CORS-origin coordination to do here —
`CORS_ORIGIN` can stay permissive (see `.env.production.example`).

**Important — this box does not use nginx.** An earlier version of this
guide assumed nginx + certbot, matching the bnhs project's own docs. In
reality this VPS reverse-proxies everything through a single **Caddy
instance running in Docker** (also fronting `n8n`), which was already in
place before StudyMate was deployed. `nginx.conf.example` in this directory
is stale/unused — kept only for reference. Use the Caddy steps below.

## 1. One-time server setup

Skip whatever's already installed for the other projects — Node.js,
PostgreSQL, and PM2 are shared across apps on this box, not per-project.
Caddy is *not* installed per-project either; it's a pre-existing Docker
container (see step 4).

```bash
# Only if not already present (check with `node -v`, `psql --version`, etc.)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs postgresql
sudo npm install -g pm2
```

Create a **separate** database and role for this app (don't reuse the bnhs
project's `bnhs_char_assessment`/`bnhs_app`):

```bash
sudo -u postgres psql -c "CREATE DATABASE studymate;"
sudo -u postgres psql -c "CREATE USER studymate_app WITH PASSWORD 'CHANGE_ME';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE studymate TO studymate_app;"
```

**Gotcha (Postgres 15+):** `GRANT ALL PRIVILEGES ON DATABASE` alone is not
enough on Postgres 15+ — new databases no longer grant `CREATE` on the
`public` schema to non-owner roles by default. Without this, `prisma
migrate deploy` fails with `permission denied for schema public`:

```bash
sudo -u postgres psql -d studymate -c "ALTER SCHEMA public OWNER TO studymate_app;"
```

## 2. Get the code onto the server

Use a deploy key scoped to *this* repo — don't reuse the bnhs project's key,
and don't use a personal access token:

```bash
ssh-keygen -t ed25519 -C "studymate-vps-deploy" -f ~/.ssh/studymate_deploy_key -N ""
cat ~/.ssh/studymate_deploy_key.pub   # paste into GitHub repo → Settings → Deploy keys (read-only)
```

Add to `~/.ssh/config` on the server (as a new `Host` entry alongside any
existing ones, e.g. `github.com-bnhs`):

```
Host github.com-studymate
    HostName github.com
    User git
    IdentityFile ~/.ssh/studymate_deploy_key
```

Clone:

```bash
git clone github.com-studymate:JosephGenio/promodo-app.git ~/promodo-app
```

(If the repo is public, skip the deploy key and just
`git clone https://github.com/JosephGenio/promodo-app.git`.)

In this deployment the repo actually lives at `/opt/promodo-app`, not
`~/promodo-app` — adjust paths below to wherever you actually clone it.

## 3. Configure and start the backend

```bash
cd /opt/promodo-app/server
cp .env.production.example .env
```

Edit `.env` — fill in the real database password (matching what you set in
step 1) and a freshly generated `JWT_SECRET` (`openssl rand -hex 32`). Leave
`PORT=4001` as-is unless you also update the Caddy block in step 4 and the
firewall rule in step 5 to match. Also fill in
`SMTP_HOST`/`SMTP_USER`/`SMTP_PASS` with real credentials — without them,
forgot-password codes only ever get logged to `pm2 logs studymate-backend`,
never actually emailed to users.

**Gotcha (Prisma 7 client generator):** `prisma/schema.prisma`'s
`generator client` block must include `moduleFormat = "cjs"`:

```prisma
generator client {
  provider     = "prisma-client"
  output       = "../src/generated/prisma"
  moduleFormat = "cjs"
}
```

Without this, Prisma's new `prisma-client` generator emits ESM output
(`import.meta.url`) by default regardless of this project's own CJS
`package.json`/`tsconfig.json` setup. It works fine under `tsx watch` in
dev (tsx tolerates it), but `node dist/index.js` in production crashes
immediately with `SyntaxError: Cannot use 'import.meta' outside a module` —
and PM2 will silently crash-loop on it. This is already fixed in the
committed schema, but if a future Prisma upgrade resets it, this is the fix.

Install, generate the Prisma client, migrate, build, and start under PM2:

```bash
npm install               # postinstall runs `prisma generate` automatically
npx prisma migrate deploy
npm run build              # tsc -> dist/
pm2 start deploy/ecosystem.config.js
pm2 save
pm2 startup   # only needed once per server — run the command it prints
```

Sanity-check locally on the box before touching Caddy/DNS at all:

```bash
curl -i http://127.0.0.1:4001/health   # expect 200 {"status":"ok"}
```

## 4. Expose it with Caddy + HTTPS

This box's Caddy runs in Docker with its config bind-mounted from the host.
Find the real path first — don't assume it matches the in-container path:

```bash
docker inspect caddy --format '{{json .Mounts}}'
```

In this deployment that resolved to
`/home/ubuntu/selfhosting-n8n-example/conf` (mounted read-write at
`/etc/caddy` inside the container), so the actual file to edit is
`/home/ubuntu/selfhosting-n8n-example/conf/Caddyfile`. See
`deploy/Caddyfile.example` in this repo for the exact block that was added.

```bash
sudo nano /home/ubuntu/selfhosting-n8n-example/conf/Caddyfile
```

Add, matching the existing `bnhs-api.synflo.space` block's pattern:

```
studymate-api.synflo.space {
  reverse_proxy 172.18.0.1:4001
}
```

`172.18.0.1` is the Docker bridge gateway IP that lets the Caddy container
reach services listening on the *host* (where PM2 runs this app, not
inside Docker) — not `localhost`/`127.0.0.1`, which inside the container
would refer to the container itself.

Reload Caddy (editing the host file alone does not apply it):

```bash
docker exec caddy caddy reload --config /etc/caddy/Caddyfile
docker exec caddy cat /etc/caddy/Caddyfile   # verify the new block is there
```

**No certbot needed.** Caddy auto-provisions and renews TLS via Let's
Encrypt for any domain in its Caddyfile, as long as DNS resolves to this
VPS and ports 80/443 reach it — which is why the DNS record below must be
**DNS only**, not proxied (see step 6).

## 5. Firewall: allow the Docker bridge to reach the new port

**This is the gotcha most likely to bite again for the next app deployed
on this box.** The host's `INPUT` chain has an explicit allow-list for
which ports the Docker bridge subnet may reach on the host, followed by a
catch-all reject. There's a pre-existing rule for bnhs's port 4000; each
new app's port needs its own matching rule, or Caddy will get a `502` even
though the app is running perfectly fine (confirmed via `curl
127.0.0.1:<port>`) and nothing shows up in its PM2 logs.

Check first:

```bash
sudo iptables -L INPUT -n -v --line-numbers
```

Look for a line like `ACCEPT tcp -- 172.18.0.0/16 0.0.0.0/0 tcp dpt:4000`
followed by a catch-all `REJECT`. Add a twin rule for this app's port,
inserted so it lands *before* the reject rule (check the line number of
the existing `4000` rule first — insert at that number + 1):

```bash
sudo iptables -I INPUT 9 -p tcp -s 172.18.0.0/16 -d 0.0.0.0/0 --dport 4001 -j ACCEPT
```

Verify it's positioned correctly:

```bash
sudo iptables -L INPUT -n -v --line-numbers
```

**Persistence:** these rules appear to have been added by hand rather than
through `ufw`, so they may not survive a reboot. Check whether they're
saved:

```bash
sudo dpkg -l | grep iptables-persistent
```

If installed, save after adding any new rule:

```bash
sudo netfilter-persistent save
```

If not installed, treat this as a known gap — a VPS reboot could silently
drop both the bnhs and StudyMate firewall rules, breaking both APIs at
once until someone notices and re-adds them.

## 6. DNS (Cloudflare)

Add an A record pointing at the VPS's public IP — get the real IP from the
box itself rather than assuming:

```bash
curl -4 ifconfig.me
```

```
Type: A
Name: studymate-api
Content: <the IP above>
Proxy status: DNS only  (grey cloud — NOT proxied)
TTL: Auto
```

**Must be DNS only, matching `bnhs-api`'s existing record.** If Cloudflare
proxying (orange cloud) is on, Cloudflare terminates TLS at its edge
instead of passing the connection through, which breaks Caddy's automatic
Let's Encrypt provisioning/renewal (the TLS-ALPN-01 challenge especially).
New Cloudflare A records default to proxied — the toggle has to be flipped
manually, and it's easy to miss.

Verify against Cloudflare's own authoritative nameserver directly (bypasses
every caching layer, including this VPS's local resolver, which has been
known to cache a stale `NXDOMAIN` from before the record existed):

```bash
dig NS synflo.space @1.1.1.1                                  # get the real nameservers
dig studymate-api.synflo.space @<nameserver-from-above> +norecurse
```

The `flags: aa` (authoritative answer) response should show the single
origin IP, not two Cloudflare edge IPs (which would mean it's still
proxied). If the box's *own* resolver (`dig studymate-api.synflo.space`,
no `@`) disagrees with this, it's a local cache issue —
`sudo systemctl restart systemd-resolved` clears it.

## 7. End-to-end verification

Test in this order — each step isolates a different layer, and the
symptoms otherwise all look identical from the mobile app ("stuck
pending" or a generic network error):

```bash
# 1. App itself, bypassing Caddy/Docker/DNS entirely
curl -i http://127.0.0.1:4001/health

# 2. Through Caddy + the Docker bridge + firewall, still bypassing DNS
docker exec caddy wget -qO- http://172.18.0.1:4001/health 2>/dev/null || true

# 3. Full path: DNS -> Cloudflare -> Caddy -> app
curl -i --max-time 15 https://studymate-api.synflo.space/health

# 4. A real route that touches the database, not just liveness
curl -i --max-time 15 -X POST https://studymate-api.synflo.space/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"diag-test@example.com","password":"TestPass123!","name":"Diag Test"}'
```

Once (3) and (4) both return promptly (not hanging, not `502`), point the
mobile app at it: set `EXPO_PUBLIC_API_BASE_URL=https://studymate-api.synflo.space`
in `mobile/.env` for Expo Go testing (restart Metro with `npx expo start
--clear` — env vars are baked in at bundle time), or in `mobile/eas.json`'s
`preview`/`production` build profiles before cutting a real `.apk` (as of
this writing those still point at a stale placeholder domain and need
updating separately).

## 8. Redeploying after code changes

```bash
cd /opt/promodo-app
git pull
cd server
npm install
npx prisma generate          # not automatic from `npm run build` alone
npx prisma migrate deploy    # safe to re-run; only applies new migrations
npm run build
pm2 restart studymate-backend
```

Or use `deploy/redeploy.sh` (same steps, scripted) once it's on the server.
If a deploy ever behaves inconsistently after a schema/generator change,
wipe build artifacts first rather than trusting an incremental build:

```bash
pm2 stop studymate-backend
rm -rf dist src/generated/prisma
npx prisma generate && npm run build
pm2 flush studymate-backend
pm2 restart studymate-backend
```

## Troubleshooting

Work through these roughly in order — each rules out one layer:

1. `pm2 list` — confirm `studymate-backend` shows `online` with a restart
   count that isn't climbing, and real (non-zero) memory usage. A crash
   loop shows `0b` memory and a fast-climbing `↺` count.
2. `pm2 logs studymate-backend --lines 40 --nostream` — runtime errors.
   `pm2 flush studymate-backend` first if you want to see only fresh
   errors, since this file accumulates across every restart.
3. `curl http://127.0.0.1:4001/health` on the VPS — is the app actually
   healthy, independent of Caddy/DNS/firewall entirely?
4. `sudo iptables -L INPUT -n -v --line-numbers` — is there an `ACCEPT`
   rule for this port from `172.18.0.0/16`, positioned before the
   catch-all `REJECT`? (See step 5 — this is the single most
   non-obvious failure mode on this box: app healthy, Caddy config
   correct, DNS correct, and still a `502`.)
5. `docker exec caddy cat /etc/caddy/Caddyfile` — is the site block
   actually there and pointing at the right port?
6. `dig studymate-api.synflo.space @1.1.1.1` vs the box's own `dig
   studymate-api.synflo.space` (no `@`) — do they agree? A mismatch means
   local resolver caching, not a real DNS problem.
7. `sudo -u postgres psql -l` — confirm the database exists and the role
   has the access privileges shown (`studymate_app=CTc/postgres` or
   similar) — relevant only if a request that touches the DB fails with
   an actual error response (not a `502`, which never gets that far).
8. If `git pull` fails with a permission error, the deploy key isn't set
   up on this server yet (see step 2) — it does not use your local
   Windows machine's git credentials.
9. `EADDRINUSE` on start almost always means `PORT` in `.env` collides
   with another app on this box — check `pm2 list` and this box's other
   projects' `.env` files before picking a port.
