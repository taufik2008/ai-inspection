import { PrismaClient } from "@prisma/client";

// Neon Cloud Database Connection String (Direct Fallback for Vercel Serverless)
const NEON_PRODUCTION_DB_URL =
  "postgresql://neondb_owner:npg_Hfam4G6xDpCt@ep-snowy-math-b33nafge-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

// Guarantee that process.env.DATABASE_URL is NEVER empty in any serverless container
if (!process.env.DATABASE_URL || process.env.DATABASE_URL.trim() === "") {
  process.env.DATABASE_URL =
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL ||
    process.env.POSTGRES_URL_NON_POOLING ||
    NEON_PRODUCTION_DB_URL;
}

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const activeUrl =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL ||
  NEON_PRODUCTION_DB_URL;

export const prisma =
  global.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: activeUrl,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

export default prisma;
