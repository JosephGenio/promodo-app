import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import { env } from '../config/env';

// Prisma 7 requires an explicit driver adapter — it no longer reads
// DATABASE_URL on its own at runtime (the CLI still does, via prisma.config.ts).
const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });

export const prisma = new PrismaClient({ adapter });
