# Backend Deployment Guide

Target: the same Linux VPS (Oracle Cloud free tier) that already hosts the
`bnhs-character-self-assessment` backend — see the notes throughout this
guide on what to keep distinct from that deployment so the two coexist.

The API lives on its own subdomain, **`studymate-api.synflo.space`**
(replace with your actual choice of domain/subdomain if different), and its
own port, **4001** — the sibling project's backend already owns port 4000
and `bnhs-api.synflo.space` on this box.

Unlike `bnhs-character-self-assessment` (separate Vercel-hosted frontends
calling the API over HTTPS), StudyMate's only client is the mobile app, so
there's no separate frontend-domain/CORS-origin coordination to do here —
`CORS_ORIGIN` can stay permissive (see `.env.production.example`).

## 1. One-time server setup

Skip whatever's already installed for the other project — Node.js,
PostgreSQL, nginx, and PM2 are shared across apps on this box, not
per-project.

```bash
# Only if not already present (check with `node -v`, `psql --version`, etc.)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs postgresql nginx certbot python3-certbot-nginx
sudo npm install -g pm2
```

Create a **separate** database and role for this app (don't reuse the bnhs
project's `bnhs_char_assessment`/`bnhs_app`):

```bash
sudo -u postgres psql -c "CREATE DATABASE studymate;"
sudo -u postgres psql -c "CREATE USER studymate_app WITH PASSWORD 'CHANGE_ME';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE studymate TO studymate_app;"
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

## 3. Configure and start the backend

```bash
cd ~/promodo-app/server
cp .env.production.example .env
```

Edit `.env` — fill in the real database password and a freshly generated
`JWT_SECRET` (`openssl rand -hex 32`). Leave `PORT=4001` as-is unless you
also change the nginx config in step 4 to match. Also fill in
`SMTP_HOST`/`SMTP_USER`/`SMTP_PASS` with real credentials — without them,
forgot-password codes only ever get logged to `pm2 logs studymate-backend`,
never actually emailed to users.

Install, generate the Prisma client, migrate, build, and start under PM2:

```bash
npm install              # postinstall runs `prisma generate` automatically
npx prisma migrate deploy
npm run build             # tsc -> dist/
pm2 start deploy/ecosystem.config.js
pm2 save
pm2 startup   # only needed once per server — run the command it prints
```

## 4. Expose it with nginx + HTTPS

```bash
sudo cp deploy/nginx.conf.example /etc/nginx/sites-available/studymate-backend
sudo ln -s /etc/nginx/sites-available/studymate-backend /etc/nginx/sites-enabled/
```

Point a DNS A record for `studymate-api.synflo.space` at the VPS's public
IP, then:

```bash
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d studymate-api.synflo.space
```

The API is now reachable at `https://studymate-api.synflo.space`. Set that
as `EXPO_PUBLIC_API_BASE_URL` in `mobile/eas.json`'s `preview`/`production`
build profiles (see `mobile/README.md`), then cut a new `.apk` build.

## 5. Redeploying after code changes

```bash
cd ~/promodo-app
git pull
cd server
npm install
npx prisma migrate deploy   # safe to re-run; only applies new migrations
npm run build
pm2 restart studymate-backend
```

Or use `deploy/redeploy.sh` (same steps, scripted) once it's on the server.

## Troubleshooting

- `pm2 list` — confirm both `studymate-backend` and (if present)
  `bnhs-char-assessment-backend` are running and not fighting over a port.
- `pm2 logs studymate-backend` — runtime errors.
- `sudo journalctl -u nginx -n 50` — nginx-level failures.
- If `git pull` fails with a permission error, the deploy key isn't set up
  on this server yet (see step 2) — it does not use your local Windows
  machine's git credentials.
- `EADDRINUSE` on start almost always means `PORT` in `.env` collides with
  another app on this box — check `pm2 list` and this box's other projects'
  `.env` files before picking a port.
