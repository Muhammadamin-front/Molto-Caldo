import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set. Copy .env.example to .env.local and fill it in.",
  );
}

// Next.js hot-reloads modules in dev, which would otherwise open a new pool on
// every reload until Postgres refuses connections.
const globalForDb = globalThis as unknown as {
  moltoCaldoSql?: ReturnType<typeof postgres>;
};

// Serverless muhitda (Vercel) har bir instans o'z pulini ochadi, shuning
// uchun u yerda `DATABASE_POOL_MAX=1..3` qo'yish tavsiya qilinadi — aks holda
// yuklama oshganda Postgres ulanishlar limitiga tez yetib boriladi.
const poolMax = Number.parseInt(process.env.DATABASE_POOL_MAX ?? "", 10);

const sql =
  globalForDb.moltoCaldoSql ??
  postgres(connectionString, {
    max: Number.isInteger(poolMax) && poolMax > 0 ? poolMax : 10,
    prepare: false,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.moltoCaldoSql = sql;
}

export const db = drizzle(sql, { schema });
export { schema };
