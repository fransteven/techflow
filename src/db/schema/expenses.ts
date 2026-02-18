import { pgTable, text, timestamp, decimal, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { productItems } from "./inventory";

// --- Expense Tracking Schema ---

// 1. Categorías para ordenar el dinero (Ej: Nómina, Servicios, Garantías, Arriendo)
export const expenseCategories = pgTable("expense_categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(), // "Garantías Técnicas", "Papelería", "Nómina"
  description: text("description"),
});

// 2. La tabla de Gastos (Salidas de dinero operativas)
export const expenses = pgTable("expenses", {
  id: uuid("id").defaultRandom().primaryKey(),
  categoryId: uuid("category_id")
    .references(() => expenseCategories.id)
    .notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description").notNull(), // "Pago a técnico por reparación iPhone X"
  date: timestamp("date").defaultNow().notNull(),
  paymentMethod: text("payment_method").default("cash").notNull(), // Transferencia, Efectivo

  // Opcional: Para relacionar un gasto con un equipo específico (Trazabilidad)
  relatedProductItemId: uuid("related_product_item_id").references(
    () => productItems.id,
  ),

  userId: text("user_id")
    .references(() => user.id)
    .notNull(), // Quién registró el gasto (Auditoría)
});
