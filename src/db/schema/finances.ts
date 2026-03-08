import { pgTable, text, timestamp, decimal, uuid } from "drizzle-orm/pg-core";

// --- TABLA DE CAJA: Para registrar abonos y pagos sin inflar las ventas ---
export const cashTransactions = pgTable("cash_transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  type: text("type").notNull(), // "sale_payment", "layaway_deposit", "expense"
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  method: text("method").notNull(), // "cash", "transfer", "card"
  referenceId: uuid("reference_id"), // Apunta a un layaway.id o sale.id o expense.id
  notes: text("notes"), // Para referencias de transferencias o detalles del movimiento
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
