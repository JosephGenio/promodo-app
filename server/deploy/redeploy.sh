#!/usr/bin/env bash
# Pull latest code, install deps, migrate, rebuild, restart PM2.
# Run from anywhere on the VPS: bash ~/promodo-app/server/deploy/redeploy.sh
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO_DIR"

git pull

cd server
# Plain install, not --omit=dev: the build (tsc) and migrate (prisma CLI)
# steps below need those devDependencies present on the server.
npm install
npx prisma migrate deploy
npm run build
pm2 restart studymate-backend
