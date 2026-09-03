CREATE TABLE `transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`amount_minor` integer NOT NULL,
	`currency` text NOT NULL,
	`direction` text NOT NULL,
	`module` text NOT NULL,
	`account` text NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`occurred_at` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
