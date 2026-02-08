import { pgTable, foreignKey, uuid, text, timestamp, numeric, boolean, unique, integer } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const productItems = pgTable("product_items", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	productId: uuid("product_id").notNull(),
	sku: text(),
	serialNumber: text("serial_number"),
	status: text().default('available').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "product_items_product_id_products_id_fk"
		}),
]);

export const products = pgTable("products", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	price: numeric({ precision: 10, scale:  2 }).notNull(),
	isSerialized: boolean("is_serialized").default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const reservations = pgTable("reservations", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	productItemId: uuid("product_item_id"),
	userId: text("user_id").notNull(),
	status: text().default('active').notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.productItemId],
			foreignColumns: [productItems.id],
			name: "reservations_product_item_id_product_items_id_fk"
		}),
]);

export const sales = pgTable("sales", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: text("user_id"),
	totalAmount: numeric("total_amount", { precision: 10, scale:  2 }).notNull(),
	status: text().default('completed').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const session = pgTable("session", {
	id: text().primaryKey().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	token: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "session_user_id_user_id_fk"
		}),
	unique("session_token_unique").on(table.token),
]);

export const inventoryMovements = pgTable("inventory_movements", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	productItemId: uuid("product_item_id"),
	productId: uuid("product_id").notNull(),
	type: text().notNull(),
	quantity: integer().notNull(),
	reason: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	unitCost: numeric("unit_cost", { precision: 10, scale:  2 }),
}, (table) => [
	foreignKey({
			columns: [table.productItemId],
			foreignColumns: [productItems.id],
			name: "inventory_movements_product_item_id_product_items_id_fk"
		}),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "inventory_movements_product_id_products_id_fk"
		}),
]);

export const saleDetails = pgTable("sale_details", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	saleId: uuid("sale_id").notNull(),
	productItemId: uuid("product_item_id"),
	price: numeric({ precision: 10, scale:  2 }).notNull(),
	productId: uuid("product_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.saleId],
			foreignColumns: [sales.id],
			name: "sale_details_sale_id_sales_id_fk"
		}),
	foreignKey({
			columns: [table.productItemId],
			foreignColumns: [productItems.id],
			name: "sale_details_product_item_id_product_items_id_fk"
		}),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "sale_details_product_id_products_id_fk"
		}),
]);

export const verification = pgTable("verification", {
	id: text().primaryKey().notNull(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
});

export const user = pgTable("user", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	emailVerified: boolean("email_verified").notNull(),
	image: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
}, (table) => [
	unique("user_email_unique").on(table.email),
]);

export const account = pgTable("account", {
	id: text().primaryKey().notNull(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id").notNull(),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at", { mode: 'string' }),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { mode: 'string' }),
	scope: text(),
	password: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "account_user_id_user_id_fk"
		}),
]);

export const expenseCategories = pgTable("expense_categories", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
});

export const expenses = pgTable("expenses", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	categoryId: uuid("category_id").notNull(),
	amount: numeric({ precision: 10, scale:  2 }).notNull(),
	description: text().notNull(),
	date: timestamp({ mode: 'string' }).defaultNow().notNull(),
	paymentMethod: text("payment_method").default('cash').notNull(),
	relatedProductItemId: uuid("related_product_item_id"),
	userId: text("user_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [expenseCategories.id],
			name: "expenses_category_id_expense_categories_id_fk"
		}),
	foreignKey({
			columns: [table.relatedProductItemId],
			foreignColumns: [productItems.id],
			name: "expenses_related_product_item_id_product_items_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "expenses_user_id_user_id_fk"
		}),
]);
