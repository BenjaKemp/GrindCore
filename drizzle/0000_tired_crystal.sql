CREATE TABLE `bank_accounts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`truelayer_id` text NOT NULL,
	`account_name` text NOT NULL,
	`account_number` text,
	`sort_code` text,
	`balance` integer,
	`currency` text DEFAULT 'GBP' NOT NULL,
	`last_synced` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `bank_accounts_truelayer_id_unique` ON `bank_accounts` (`truelayer_id`);--> statement-breakpoint
CREATE TABLE `income_streams` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`amount` integer NOT NULL,
	`frequency` text NOT NULL,
	`bank_account_id` text,
	`status` text DEFAULT 'active' NOT NULL,
	`description` text,
	`next_payment_date` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`income_stream_id` integer NOT NULL,
	`amount` integer NOT NULL,
	`date` integer NOT NULL,
	`description` text,
	`truelayer_id` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`income_stream_id`) REFERENCES `income_streams`(`id`) ON UPDATE no action ON DELETE cascade
);
