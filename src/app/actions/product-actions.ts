"use server";

import { revalidatePath } from "next/cache";
import { productSchema } from "@/lib/validators/product-validator";
import * as productService from "@/services/product-service";
import * as categoryService from "@/services/category-service";

export async function createProductAction(data: unknown) {
  const result = productSchema.safeParse(data);

  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  try {
    // 1. Get Category Name
    let categoryName = "GEN";
    if (result.data.categoryId) {
      const category = await categoryService.getCategoryById(
        result.data.categoryId,
      );
      if (category) {
        categoryName = category.name;
      }
    }

    // 2. Generate Base SKU
    const { generateBaseSKU } = await import("@/lib/utils");
    const baseSKU = generateBaseSKU(
      categoryName,
      result.data.name,
      result.data.attributes,
    );

    // 3. Add Unique Suffix (3-4 chars random)
    // Math.random gives 0.xxxx. toString(36) gives 0.alphanum.
    // Substring(2, 6) gives 4 chars.
    const suffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    const finalSKU = `${baseSKU}-${suffix}`;

    // 4. Create Product with SKU
    await productService.createProduct({
      ...result.data,
      sku: finalSKU,
    });

    revalidatePath("/dashboard/catalog");
    return { success: true };
  } catch (error) {
    console.error("Error creating product:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to create product" };
  }
}

export async function updateProductAction(id: string, data: unknown) {
  const result = productSchema.partial().safeParse(data);

  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  try {
    const updated = await productService.updateProduct(id, result.data);
    if (!updated) return { success: false, error: "Product not found" };

    revalidatePath("/dashboard/catalog");
    return { success: true };
  } catch (error) {
    console.error("Error updating product:", error);
    return { success: false, error: "Failed to update product" };
  }
}

export async function deleteProductAction(id: string) {
  try {
    const deleted = await productService.deleteProduct(id);
    if (!deleted) return { success: false, error: "Product not found" };

    revalidatePath("/dashboard/catalog");
    return { success: true };
  } catch (error) {
    console.error("Error deleting product:", error);
    return { success: false, error: "Failed to delete product" };
  }
}

export async function getProductsAction() {
  try {
    const products = await productService.getProducts();
    return { success: true, data: products };
  } catch (error) {
    console.error("Error fetching products:", error);
    return { success: false, error: "Failed to fetch products" };
  }
}
