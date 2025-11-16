import type { Config } from 'drizzle-kit';

// Use SQLite for local dev (no DATABASE_URL), PostgreSQL for production
const databaseUrl = process.env.DATABASE_URL;

export default databaseUrl
  ? {
      schema: './db/schema.ts',
      out: './drizzle',
      dialect: 'postgresql',
      dbCredentials: {
        url: databaseUrl,
      },
    } satisfies Config
  : {
      schema: './db/schema.ts',
      out: './drizzle',
      dialect: 'sqlite',
      dbCredentials: {
        url: 'sqlite.db',
      },
    } satisfies Config;
