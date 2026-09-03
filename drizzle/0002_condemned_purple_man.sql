CREATE TABLE `accounts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`currency` text NOT NULL,
	`type` text NOT NULL,
	`initial_balance_minor` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_accounts_user_name_currency` ON `accounts` (`user_id`,`name`,`currency`);--> statement-breakpoint
CREATE INDEX `idx_accounts_user_currency` ON `accounts` (`user_id`,`currency`);--> statement-breakpoint
INSERT OR IGNORE INTO `accounts` (`user_id`, `name`, `currency`, `type`, `initial_balance_minor`)
SELECT DISTINCT `user_id`, `account`, `currency`, 'wallet', 0 FROM `transactions`;
--> statement-breakpoint
ALTER TABLE `transactions` ADD `account_id` integer REFERENCES accounts(id);--> statement-breakpoint
UPDATE `transactions` SET `account_id` = (
  SELECT `accounts`.`id` FROM `accounts`
  WHERE `accounts`.`user_id` = `transactions`.`user_id`
    AND `accounts`.`name` = `transactions`.`account`
    AND `accounts`.`currency` = `transactions`.`currency`
);
--> statement-breakpoint
CREATE INDEX `idx_transactions_user_account` ON `transactions` (`user_id`,`account_id`);