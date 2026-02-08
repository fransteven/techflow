import { relations } from "drizzle-orm/relations";
import { products, productItems, reservations, user, session, inventoryMovements, sales, saleDetails, account, expenseCategories, expenses } from "./schema";

export const productItemsRelations = relations(productItems, ({one, many}) => ({
	product: one(products, {
		fields: [productItems.productId],
		references: [products.id]
	}),
	reservations: many(reservations),
	inventoryMovements: many(inventoryMovements),
	saleDetails: many(saleDetails),
	expenses: many(expenses),
}));

export const productsRelations = relations(products, ({many}) => ({
	productItems: many(productItems),
	inventoryMovements: many(inventoryMovements),
	saleDetails: many(saleDetails),
}));

export const reservationsRelations = relations(reservations, ({one}) => ({
	productItem: one(productItems, {
		fields: [reservations.productItemId],
		references: [productItems.id]
	}),
}));

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	sessions: many(session),
	accounts: many(account),
	expenses: many(expenses),
}));

export const inventoryMovementsRelations = relations(inventoryMovements, ({one}) => ({
	productItem: one(productItems, {
		fields: [inventoryMovements.productItemId],
		references: [productItems.id]
	}),
	product: one(products, {
		fields: [inventoryMovements.productId],
		references: [products.id]
	}),
}));

export const saleDetailsRelations = relations(saleDetails, ({one}) => ({
	sale: one(sales, {
		fields: [saleDetails.saleId],
		references: [sales.id]
	}),
	productItem: one(productItems, {
		fields: [saleDetails.productItemId],
		references: [productItems.id]
	}),
	product: one(products, {
		fields: [saleDetails.productId],
		references: [products.id]
	}),
}));

export const salesRelations = relations(sales, ({many}) => ({
	saleDetails: many(saleDetails),
}));

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const expensesRelations = relations(expenses, ({one}) => ({
	expenseCategory: one(expenseCategories, {
		fields: [expenses.categoryId],
		references: [expenseCategories.id]
	}),
	productItem: one(productItems, {
		fields: [expenses.relatedProductItemId],
		references: [productItems.id]
	}),
	user: one(user, {
		fields: [expenses.userId],
		references: [user.id]
	}),
}));

export const expenseCategoriesRelations = relations(expenseCategories, ({many}) => ({
	expenses: many(expenses),
}));