import { relations } from "drizzle-orm";
import { user } from "./auth";
import {
  categories,
  products,
  productItems,
  inventoryMovements,
  reservations,
} from "./inventory";
import { sales, saleDetails } from "./sales";
import { expenseCategories, expenses } from "./expenses";

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
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
