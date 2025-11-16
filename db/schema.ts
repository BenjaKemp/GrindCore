import { pgTable, text, integer, timestamp, serial, real } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Users table (synced with Clerk)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  clerkId: text('clerk_id').notNull().unique(),
  email: text('email').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Bank connections (TrueLayer OAuth tokens)
export const connections = pgTable('connections', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  provider: text('provider').notNull().default('truelayer'),
  accessToken: text('access_token').notNull(),
  refreshToken: text('refresh_token'),
  tokenExpiresAt: timestamp('token_expires_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Bank accounts
export const bankAccounts = pgTable('bank_accounts', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  connectionId: integer('connection_id').notNull(),
  trueLayerId: text('truelayer_id').notNull().unique(),
  accountName: text('account_name').notNull(),
  accountNumber: text('account_number'),
  sortCode: text('sort_code'),
  balance: integer('balance'), // Balance in pence
  currency: text('currency').notNull().default('GBP'),
  lastSynced: timestamp('last_synced'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Transactions (auto-fetched from TrueLayer)
export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  bankAccountId: integer('bank_account_id').notNull(),
  trueLayerId: text('truelayer_id').notNull().unique(),
  amount: real('amount').notNull(), // Amount in GBP (decimal)
  description: text('description').notNull(),
  category: text('category'), // Auto-classified: 'dividend', 'interest', 'rental', 'other'
  transactionDate: timestamp('transaction_date').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Income streams (manual tracking)
export const incomeStreams = pgTable('income_streams', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  category: text('category').notNull(), // 'investment', 'rental', 'freelance', 'business', 'other'
  amount: integer('amount').notNull(), // Amount in pence
  frequency: text('frequency').notNull(), // 'weekly', 'monthly', 'quarterly', 'yearly', 'one-time'
  bankAccountId: text('bank_account_id'), // TrueLayer account ID
  status: text('status').notNull().default('active'), // 'active', 'inactive', 'pending'
  description: text('description'),
  nextPaymentDate: timestamp('next_payment_date'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
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
