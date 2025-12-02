import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    balance: integer("balance").notNull().default(0), // In cents
    allowance: integer("allowance").notNull().default(0), // In cents
    createdAt: text("created_at")
        .notNull()
        .default(sql`(current_timestamp)`),
});

export const products = sqliteTable("products", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    barcode: text("barcode").notNull().unique(),
    price: integer("price").notNull(), // In cents
    stock: integer("stock").notNull().default(0),
    createdAt: text("created_at")
        .notNull()
        .default(sql`(current_timestamp)`),
});

export const transactions = sqliteTable("transactions", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id").references(() => users.id),
    total: integer("total").notNull(), // In cents
    items: text("items").notNull(), // JSON string of items
    timestamp: text("timestamp")
        .notNull()
        .default(sql`(current_timestamp)`),
});
