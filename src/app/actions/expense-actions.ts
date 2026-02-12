"use server";

import { revalidatePath } from "next/cache";
import {
  createExpenseSchema,
  createExpenseCategorySchema,
} from "@/lib/validators/expense-validator";
import * as expenseService from "@/services/expense-service";
import { auth } from "@/lib/auth"; // Assuming auth is exported from here
import { headers } from "next/headers";

export async function createExpenseAction(data: unknown) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  const result = createExpenseSchema.safeParse(data);

  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  try {
    await expenseService.createExpense({
      ...result.data,
      userId: session.user.id,
    });
    revalidatePath("/expenses");
    return { success: true };
  } catch (error) {
    console.error("Error creating expense:", error);
    return { success: false, error: "Failed to create expense" };
  }
}

export async function createExpenseCategoryAction(data: unknown) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  const result = createExpenseCategorySchema.safeParse(data);

  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  try {
    await expenseService.createExpenseCategory(result.data);
    revalidatePath("/expenses");
    return { success: true };
  } catch (error) {
    console.error("Error creating expense category:", error);
    return { success: false, error: "Failed to create expense category" };
  }
}

export async function getExpensesAction() {
  try {
    const expenses = await expenseService.getExpenses();
    const categories = await expenseService.getExpenseCategories();
    return { success: true, data: { expenses, categories } };
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return { success: false, error: "Failed to fetch expenses" };
  }
}
