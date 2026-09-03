import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const accounts = sqliteTable("accounts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  currency: text("currency").notNull(),
  type: text("type").notNull(),
  initialBalanceMinor: integer("initial_balance_minor").notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  uniqueIndex("idx_accounts_user_name_currency").on(table.userId, table.name, table.currency),
  index("idx_accounts_user_currency").on(table.userId, table.currency),
]);

export const transactions = sqliteTable("transactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  amountMinor: integer("amount_minor").notNull(),
  currency: text("currency").notNull(),
  direction: text("direction").notNull(),
  module: text("module").notNull(),
  account: text("account").notNull(),
  accountId: integer("account_id").references(() => accounts.id, { onDelete: "restrict" }),
  note: text("note").notNull().default(""),
  occurredAt: text("occurred_at").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
  index("idx_transactions_user_occurred").on(table.userId, table.occurredAt),
  index("idx_transactions_user_account").on(table.userId, table.accountId),
]);
