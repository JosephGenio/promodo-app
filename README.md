# StudyMate

Thesis project: an Android app (React Native/Expo) backed by a Node.js API (Express + Prisma) on PostgreSQL, deployed to an Oracle Cloud VPS. Internal repo/package names (`promodo`, `com.thesis.promodoapp`) predate the StudyMate rename and are kept as-is to avoid re-provisioning the EAS project and Android app identity.

See [plan.md](plan.md) for the full architecture and scaffold plan.

## Structure

- `mobile/` — Expo React Native app (TypeScript). See [mobile/README.md](mobile/README.md).
- `server/` — Express + Prisma API (TypeScript). *(coming next)*
- `deploy/` — deployment configs/docs for the Oracle VPS. *(coming next)*

## Getting started

Each subproject is installed independently:

```bash
cd mobile && npm install
cd server && npm install   # once added
```
