import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  decimal,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

//Es la ficha del producto en el catálogo general
export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  //Precio de venta sugerido
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  isSerialized: boolean("is_serialized").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const productItems = pgTable("product_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  productId: uuid("product_id")
    .references(() => products.id)
    .notNull(),
  sku: text("sku"),
  serialNumber: text("serial_number"), // imei or serial
  status: text("status").default("available").notNull(), // available, sold, reserved, defective
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const inventoryMovements = pgTable("inventory_movements", {
  id: uuid("id").defaultRandom().primaryKey(),
  productItemId: uuid("product_item_id").references(() => productItems.id),
  productId: uuid("product_id")
    .references(() => products.id)
    .notNull(), // For non-serialized tracking or redundancy
  type: text("type").notNull(), // IN, OUT, ADJUSTMENT
  quantity: integer("quantity").notNull(),
  unitCost: decimal("unit_cost", { precision: 10, scale: 2 }),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reservations = pgTable("reservations", {
  id: uuid("id").defaultRandom().primaryKey(),
  productItemId: uuid("product_item_id").references(() => productItems.id),
  userId: text("user_id").notNull(), // Link to Better Auth user ID (string usually)
  status: text("status").default("active").notNull(), // active, expired, completed
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

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

export const productsRelations = relations(products, ({ many }) => ({
  productItems: many(productItems),
  saleDetails: many(saleDetails),
  inventoryMovements: many(inventoryMovements),
}));

export const productItemsRelations = relations(
  productItems,
  ({ one, many }) => ({
    product: one(products, {
      fields: [productItems.productId],
      references: [products.id],
    }),
    saleDetails: many(saleDetails),
    inventoryMovements: many(inventoryMovements),
    reservations: many(reservations),
  }),
);

export const inventoryMovementsRelations = relations(
  inventoryMovements,
  ({ one }) => ({
    product: one(products, {
      fields: [inventoryMovements.productId],
      references: [products.id],
    }),
    productItem: one(productItems, {
      fields: [inventoryMovements.productItemId],
      references: [productItems.id],
    }),
  }),
);

export const reservationsRelations = relations(reservations, ({ one }) => ({
  productItem: one(productItems, {
    fields: [reservations.productItemId],
    references: [productItems.id],
  }),
}));

export const salesRelations = relations(sales, ({ many }) => ({
  saleDetails: many(saleDetails),
}));

export const saleDetailsRelations = relations(saleDetails, ({ one }) => ({
  sale: one(sales, {
    fields: [saleDetails.saleId],
    references: [sales.id],
  }),
  product: one(products, {
    fields: [saleDetails.productId],
    references: [products.id],
  }),
  productItem: one(productItems, {
    fields: [saleDetails.productItemId],
    references: [productItems.id],
  }),
}));

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

export const expenseCategoriesRelations = relations(
  expenseCategories,
  ({ many }) => ({
    expenses: many(expenses),
  }),
);

export const expensesRelations = relations(expenses, ({ one }) => ({
  category: one(expenseCategories, {
    fields: [expenses.categoryId],
    references: [expenseCategories.id],
  }),
  relatedProductItem: one(productItems, {
    fields: [expenses.relatedProductItemId],
    references: [productItems.id],
  }),
  user: one(user, {
    fields: [expenses.userId],
    references: [user.id],
  }),
}));

// Better Auth Schema
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});
