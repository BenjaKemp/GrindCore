import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Users table (synced with Clerk)
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  clerkId: text('clerk_id').notNull().unique(),
  email: text('email').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

// Bank connections (TrueLayer OAuth tokens)
export const connections = sqliteTable('connections', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  provider: text('provider').notNull().default('truelayer'),
  accessToken: text('access_token').notNull(),
  refreshToken: text('refresh_token'),
  tokenExpiresAt: integer('token_expires_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

// Bank accounts
export const bankAccounts = sqliteTable('bank_accounts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  connectionId: integer('connection_id').notNull(),
  trueLayerId: text('truelayer_id').notNull().unique(),
  accountName: text('account_name').notNull(),
  accountNumber: text('account_number'),
  sortCode: text('sort_code'),
  balance: integer('balance'), // Balance in pence
  currency: text('currency').notNull().default('GBP'),
  lastSynced: integer('last_synced', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

// Transactions (auto-fetched from TrueLayer)
export const transactions = sqliteTable('transactions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  bankAccountId: integer('bank_account_id').notNull(),
  trueLayerId: text('truelayer_id').notNull().unique(),
  amount: real('amount').notNull(), // Amount in GBP (decimal)
  description: text('description').notNull(),
  category: text('category'), // Auto-classified: 'dividend', 'interest', 'rental', 'other'
  transactionDate: integer('transaction_date', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

// Income streams (manual tracking)
export const incomeStreams = sqliteTable('income_streams', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  category: text('category').notNull(), // 'investment', 'rental', 'freelance', 'business', 'other'
  amount: integer('amount').notNull(), // Amount in pence
  frequency: text('frequency').notNull(), // 'weekly', 'monthly', 'quarterly', 'yearly', 'one-time'
  bankAccountId: text('bank_account_id'), // TrueLayer account ID
  status: text('status').notNull().default('active'), // 'active', 'inactive', 'pending'
  description: text('description'),
  nextPaymentDate: integer('next_payment_date', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Connection = typeof connections.$inferSelect;
export type NewConnection = typeof connections.$inferInsert;
export type BankAccount = typeof bankAccounts.$inferSelect;
export type NewBankAccount = typeof bankAccounts.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
export type IncomeStream = typeof incomeStreams.$inferSelect;
export type NewIncomeStream = typeof incomeStreams.$inferInsert;
