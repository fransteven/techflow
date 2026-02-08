import { db } from "@/db";
import { expenses, expenseCategories, user } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import {
  CreateExpenseInput,
  CreateExpenseCategoryInput,
} from "@/lib/validators/expense-validator";

export type ExpenseWithDetails = Awaited<
  ReturnType<typeof getExpenses>
>[number];

export const getExpenses = async () => {
  return await db
    .select({
      id: expenses.id,
      amount: expenses.amount,
      description: expenses.description,
      date: expenses.date,
      paymentMethod: expenses.paymentMethod,
      categoryName: expenseCategories.name,
      userName: user.name,
    })
    .from(expenses)
    .leftJoin(expenseCategories, eq(expenses.categoryId, expenseCategories.id))
    .leftJoin(user, eq(expenses.userId, user.id))
    .orderBy(desc(expenses.date));
};

export const createExpense = async (
  data: CreateExpenseInput & { userId: string },
) => {
  const result = await db
    .insert(expenses)
    .values({
      amount: data.amount.toString(),
      description: data.description,
      categoryId: data.categoryId,
      paymentMethod: data.paymentMethod,
      date: data.date || new Date(),
      relatedProductItemId: data.relatedProductItemId,
      userId: data.userId,
    })
    .returning();
  return result[0];
};

export const getExpenseCategories = async () => {
  return await db
    .select()
    .from(expenseCategories)
    .orderBy(expenseCategories.name);
};

export const createExpenseCategory = async (
  data: CreateExpenseCategoryInput,
) => {
  const result = await db.insert(expenseCategories).values(data).returning();
  return result[0];
};
