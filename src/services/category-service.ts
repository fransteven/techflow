import { db } from "@/db";
import { categories } from "@/db/schema";
import { CategoryInput } from "@/lib/validators/category-validator";
import { desc, eq } from "drizzle-orm";

export const getCategories = async () => {
  return await db.select().from(categories).orderBy(desc(categories.name));
};

export const createCategory = async (data: CategoryInput) => {
  const result = await db.insert(categories).values(data).returning();
  return result[0];
};

export const deleteCategory = async (id: string) => {
  const result = await db
    .delete(categories)
    .where(eq(categories.id, id))
    .returning();
  if (result.length === 0) return null;
  return result[0];
};
