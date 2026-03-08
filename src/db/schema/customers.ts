import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

// --- TABLA: Clientes (Directorio CRM Básico) ---
export const customers = pgTable("customers", {
  id: uuid("id").defaultRandom().primaryKey(),
  documentId: text("document_id").unique(), // Cédula, NIT, etc.
  name: text("name").notNull(),
  phone: text("phone"),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
