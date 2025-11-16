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

// Crypto wallets
export const cryptoWallets = sqliteTable('crypto_wallets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  address: text('address').notNull().unique(),
  chain: text('chain').notNull(), // 'ethereum', 'solana', 'cardano', 'binance'
  label: text('label'), // Optional user label
  lastScanned: integer('last_scanned', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

// Crypto staking rewards
export const cryptoRewards = sqliteTable('crypto_rewards', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  walletId: integer('wallet_id').notNull(),
  userId: text('user_id').notNull(),
  token: text('token').notNull(), // 'ETH', 'SOL', 'ADA', 'BNB'
  amount: real('amount').notNull(), // Amount in crypto
  amountGBP: real('amount_gbp'), // Value in GBP at time of reward
  source: text('source').notNull(), // 'lido', 'rocketpool', 'marinade', 'jito', 'solflare', 'cardano', 'pancakeswap'
  rewardDate: integer('reward_date', { mode: 'timestamp' }).notNull(),
  txHash: text('tx_hash'), // Transaction hash if available
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

// P2P lending accounts
export const p2pAccounts = sqliteTable('p2p_accounts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  provider: text('provider').notNull(), // 'zopa', 'ratesetter', 'lendingworks'
  email: text('email').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  tokenExpiresAt: integer('token_expires_at', { mode: 'timestamp' }),
  lastSynced: integer('last_synced', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

// P2P interest payments
export const p2pInterest = sqliteTable('p2p_interest', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  accountId: integer('account_id').notNull(),
  userId: text('user_id').notNull(),
  amount: real('amount').notNull(), // Interest amount in GBP
  rate: real('rate'), // Annual interest rate (e.g., 5.2 for 5.2%)
  interestDate: integer('interest_date', { mode: 'timestamp' }).notNull(),
  description: text('description'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
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
export type CryptoWallet = typeof cryptoWallets.$inferSelect;
export type NewCryptoWallet = typeof cryptoWallets.$inferInsert;
export type CryptoReward = typeof cryptoRewards.$inferSelect;
export type NewCryptoReward = typeof cryptoRewards.$inferInsert;
export type P2PAccount = typeof p2pAccounts.$inferSelect;
export type NewP2PAccount = typeof p2pAccounts.$inferInsert;
export type P2PInterest = typeof p2pInterest.$inferSelect;
export type NewP2PInterest = typeof p2pInterest.$inferInsert;
