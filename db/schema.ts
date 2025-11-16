import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const incomeStreams = sqliteTable('income_streams', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  category: text('category').notNull(), // e.g., 'investment', 'rental', 'freelance', 'business', 'other'
  amount: integer('amount').notNull(), // Amount in pence
  frequency: text('frequency').notNull(), // 'weekly', 'monthly', 'quarterly', 'yearly', 'one-time'
  bankAccountId: text('bank_account_id'), // TrueLayer account ID
  status: text('status').notNull().default('active'), // 'active', 'inactive', 'pending'
  description: text('description'),
  nextPaymentDate: integer('next_payment_date', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

export const transactions = sqliteTable('transactions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  incomeStreamId: integer('income_stream_id').notNull().references(() => incomeStreams.id, { onDelete: 'cascade' }),
  amount: integer('amount').notNull(), // Amount in pence
  date: integer('date', { mode: 'timestamp' }).notNull(),
  description: text('description'),
  trueLayerId: text('truelayer_id'), // TrueLayer transaction ID
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

export const bankAccounts = sqliteTable('bank_accounts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  trueLayerId: text('truelayer_id').notNull().unique(),
  accountName: text('account_name').notNull(),
  accountNumber: text('account_number'),
  sortCode: text('sort_code'),
  balance: integer('balance'), // Balance in pence
  currency: text('currency').notNull().default('GBP'),
  lastSynced: integer('last_synced', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

export type IncomeStream = typeof incomeStreams.$inferSelect;
export type NewIncomeStream = typeof incomeStreams.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
export type BankAccount = typeof bankAccounts.$inferSelect;
export type NewBankAccount = typeof bankAccounts.$inferInsert;
