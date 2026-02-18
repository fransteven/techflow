"use server";

import { revalidatePath } from "next/cache";
import { categorySchema } from "@/lib/validators/category-validator";
import * as categoryService from "@/services/category-service";

export async function createCategoryAction(data: unknown) {
  const result = categorySchema.safeParse(data);

  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  try {
    await categoryService.createCategory(result.data);
    revalidatePath("/dashboard/catalog");
    return { success: true };
  } catch (error) {
    console.error("Error creating category:", error);
    return { success: false, error: "Failed to create category" };
  }
}

export async function getCategoriesAction() {
  try {
    const categories = await categoryService.getCategories();
    return { success: true, data: categories };
  } catch (error) {
    console.error("Error fetching categories:", error);
    return { success: false, error: "Failed to fetch categories" };
  }
}

export async function deleteCategoryAction(id: string) {
  try {
    await categoryService.deleteCategory(id);
    revalidatePath("/dashboard/catalog");
    return { success: true };
  } catch (error) {
    console.error("Error deleting category:", error);
    return { success: false, error: "Failed to delete category" };
  }
}
