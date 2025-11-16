import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Use SQLite for local dev, PostgreSQL for production
const isDev = process.env.NODE_ENV === 'development' && !process.env.DATABASE_URL;

let db: ReturnType<typeof drizzle>;

if (isDev) {
  // Dev fallback: Use better-sqlite3
  const Database = require('better-sqlite3');
  const { drizzle: drizzleSqlite } = require('drizzle-orm/better-sqlite3');
  const sqlite = new Database('sqlite.db');
  db = drizzleSqlite(sqlite, { schema });
} else {
  // Production: Use PostgreSQL
  const connectionString = process.env.DATABASE_URL!;
  const client = postgres(connectionString);
  db = drizzle(client, { schema });
}

export { db };
