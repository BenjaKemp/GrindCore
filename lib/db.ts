// For API routes, check if DATABASE_URL is set for production PostgreSQL
import * as schema from '../db/schema';

// Use SQLite for local dev, PostgreSQL for production
const isDev = !process.env.DATABASE_URL;

let db: any;

if (isDev) {
  // Development: Use SQLite
  const Database = require('better-sqlite3');
  const { drizzle: drizzleSqlite } = require('drizzle-orm/better-sqlite3');
  const sqlite = new Database('sqlite.db');
  db = drizzleSqlite(sqlite, { schema });
} else {
  // Production: Use PostgreSQL
  const postgres = require('postgres');
  const { drizzle: drizzlePostgres } = require('drizzle-orm/postgres-js');
  const connectionString = process.env.DATABASE_URL!;
  const client = postgres(connectionString);
  db = drizzlePostgres(client, { schema });
}

export { db };
