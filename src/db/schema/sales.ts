import { pgTable, text, timestamp, decimal, uuid } from "drizzle-orm/pg-core";
import { productItems, products } from "./inventory";

export const sales = pgTable("sales", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id"), // Optional if guest checkout allowed
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").default("completed").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const saleDetails = pgTable("sale_details", {
  id: uuid("id").defaultRandom().primaryKey(),
  saleId: uuid("sale_id")
    .references(() => sales.id)
    .notNull(),
  productItemId: uuid("product_item_id").references(() => productItems.id),
  productId: uuid("product_id")
    .references(() => products.id)
    .notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
});
