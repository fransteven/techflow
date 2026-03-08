import {
  pgTable,
  text,
  integer,
  timestamp,
  decimal,
  uuid,
} from "drizzle-orm/pg-core";
import { customers } from "./customers";
import { products, productItems } from "./inventory";

// --- TABLA CABECERA: El documento de Apartado ---
export const layaways = pgTable("layaways", {
  id: uuid("id").defaultRandom().primaryKey(),
  customerId: uuid("customer_id")
    .references(() => customers.id)
    .notNull(),
  status: text("status").default("active").notNull(), // active, completed, cancelled
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// --- TABLA DETALLE: Qué artículos exactos se están apartando ---
export const layawayDetails = pgTable("layaway_details", {
  id: uuid("id").defaultRandom().primaryKey(),
  layawayId: uuid("layaway_id")
    .references(() => layaways.id)
    .notNull(),
  productId: uuid("product_id")
    .references(() => products.id)
    .notNull(),
  productItemId: uuid("product_item_id").references(() => productItems.id), // Null si es producto genérico, UUID si es teléfono con IMEI
  quantity: integer("quantity").default(1).notNull(),
  agreedPrice: decimal("agreed_price", { precision: 10, scale: 2 }).notNull(),
});
