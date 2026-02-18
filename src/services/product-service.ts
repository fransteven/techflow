import { db } from "@/db";
import {
  products,
  productItems,
  inventoryMovements,
  categories,
} from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { ProductInput } from "@/lib/validators/product-validator";

export type ProductWithStock = Awaited<ReturnType<typeof getProducts>>[number];

export const getProducts = async () => {
  return await db
    .select({
      id: products.id,
      name: products.name,
      description: products.description,
      price: products.price,
      isSerialized: products.isSerialized,
      createdAt: products.createdAt,
      updatedAt: products.updatedAt,
      //COALESCE funciona como un if null, si el resultado es null, devuelve 0
      stock: sql<number>`
        CASE
          WHEN ${products.isSerialized} THEN (
            SELECT COUNT(*)
            FROM ${productItems}
            WHERE ${productItems.productId} = ${products.id}
              AND ${productItems.status} = 'available'
          )
          ELSE (
            COALESCE((
              SELECT SUM(${inventoryMovements.quantity})
              FROM ${inventoryMovements}
              WHERE ${inventoryMovements.productId} = ${products.id}
                AND ${inventoryMovements.type} = 'IN'
            ), 0) -
            COALESCE((
              SELECT SUM(${inventoryMovements.quantity})
              FROM ${inventoryMovements}
              WHERE ${inventoryMovements.productId} = ${products.id}
                AND ${inventoryMovements.type} = 'OUT'
            ), 0)
          )
        END
      `.mapWith(Number),
      categoryName: categories.name,
      attributes: products.attributes,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .orderBy(desc(products.createdAt));
};

export const getProductById = async (id: string) => {
  const result = await db.select().from(products).where(eq(products.id, id));
  if (result.length === 0) return null;
  return result[0];
};

export const createProduct = async (data: ProductInput) => {
  const existingProduct = await db
    .select()
    .from(products)
    .where(sql`LOWER(${products.name}) = LOWER(${data.name})`)
    .limit(1);

  if (existingProduct.length > 0) {
    throw new Error("Ya existe un producto con este nombre.");
  }

  const result = await db.insert(products).values(data).returning();
  return result[0];
};

export const updateProduct = async (
  id: string,
  data: Partial<ProductInput>,
) => {
  const result = await db
    .update(products)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(products.id, id))
    .returning();

  if (result.length === 0) return null;
  return result[0];
};

export const deleteProduct = async (id: string) => {
  const result = await db
    .delete(products)
    .where(eq(products.id, id))
    .returning();
  if (result.length === 0) return null;
  return result[0];
};
