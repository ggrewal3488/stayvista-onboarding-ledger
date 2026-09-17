import { Pool } from "pg";

const connectionString =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL;

let pool = global._svPool;
if (!pool) {
  if (!connectionString) {
    // Defer the throw until a query actually runs, so the app can still
    // boot (and show a clear error) before Postgres is connected.
    pool = null;
  } else {
    pool = new Pool({
      connectionString,
      ssl: connectionString.includes("sslmode=disable")
        ? false
        : { rejectUnauthorized: false },
      max: 5,
    });
  }
  global._svPool = pool;
}

let initialized = false;

export async function query(text, params) {
  if (!pool) {
    throw new Error(
      "No database connected. Link a Postgres storage integration to this Vercel project (Storage -> Create Database -> Postgres), then redeploy."
    );
  }
  if (!initialized) {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS properties (
        id TEXT PRIMARY KEY,
        data JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
    initialized = true;
  }
  return pool.query(text, params);
}

export function rowToProperty(row) {
  return {
    id: row.id,
    ...row.data,
    createdAt: row.data.createdAt || row.created_at,
    updatedAt: row.updated_at,
  };
}
