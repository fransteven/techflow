import { db } from "@/db";
import {
  products,
  productItems,
  inventoryMovements,
  sales,
  saleDetails,
} from "@/db/schema";
import { eq, sql, and } from "drizzle-orm";
import type {
  ProductSearchResult,
  ProcessSaleInput,
} from "@/lib/validators/pos-validator";

/**
 * Search for a product by barcode (SKU or serial number)
 * Returns product details including available quantity and average unit cost
 */
/**
 * Search for a product by barcode (SKU or serial number) or Name
 */
export const searchProduct = async (
  query: string,
): Promise<ProductSearchResult | null> => {
  // 1. Try to find by SKU/Serial in productItems (Serialized items)
  const itemResult = await db
    .select({
      productItem: productItems,
      product: products,
    })
    .from(productItems)
    .innerJoin(products, eq(productItems.productId, products.id))
    .where(
      sql`${productItems.sku} = ${query} OR ${productItems.serialNumber} = ${query}`,
    )
    .limit(1);

  if (itemResult.length > 0) {
    const { productItem, product } = itemResult[0];
    return {
      productId: product.id,
      productItemId: productItem.id,
      name: product.name,
      suggestedPrice: product.price,
      availableQty: 1, // Specific item found
      avgUnitCost: 0, // Pending calculation if needed
      isSerialized: true,
      sku: productItem.sku,
    };
  }

  // 2. Try to find product by Name (Non-serialized or generalized search)
  // We prioritize finding non-serialized products here if query matches name
  const productResult = await db
    .select()
    .from(products)
    .where(sql`${products.name} ILIKE ${`%${query}%`}`)
    .limit(1);

  if (productResult.length === 0) {
    return null;
  }

  const product = productResult[0];

  // Calculate available quantity
  let availableQty = 0;
  let avgUnitCost = 0;

  if (product.isSerialized) {
    // If we found a serialized product by NAME, we can show we found it,
    // but we can't sell it without a specific serial number.
    // However, the requested logic implies we want to support finding it.
    // For now, let's count TOTAL available items of this product type.
    const availableItems = await db
      .select({ count: sql<string>`COUNT(*)` })
      .from(productItems)
      .where(
        and(
          eq(productItems.productId, product.id),
          eq(productItems.status, "available"),
        ),
      );
    availableQty = Number(availableItems[0]?.count || 0);
  } else {
    // Non-serialized: Calculate from inventory movements
    const movements = await db
      .select({
        total: sql<string>`SUM(CASE WHEN ${inventoryMovements.type} = 'IN' THEN ${inventoryMovements.quantity} ELSE -${inventoryMovements.quantity} END)`,
      })
      .from(inventoryMovements)
      .where(eq(inventoryMovements.productId, product.id));

    availableQty = Number(movements[0]?.total || 0);

    // Calculate avg cost
    const costData = await db
      .select({
        avgCost: sql<number>`COALESCE(AVG(CAST(${inventoryMovements.unitCost} AS DECIMAL)), 0)`,
      })
      .from(inventoryMovements)
      .where(
        and(
          eq(inventoryMovements.productId, product.id),
          eq(inventoryMovements.type, "IN"),
        ),
      );
    avgUnitCost = Number(costData[0]?.avgCost || 0);
  }

  return {
    productId: product.id,
    productItemId: null, // Null because we found the generic product, not a specific instance
    name: product.name,
    suggestedPrice: product.price,
    availableQty,
    avgUnitCost,
    isSerialized: product.isSerialized,
    sku: null,
  };
};

/**
 * Process a sale transaction
 */
export const processSale = async ({
  items,
  totalAmount,
  userId,
}: ProcessSaleInput) => {
  return await db.transaction(async (tx) => {
    // 1. Create the sale record
    const [sale] = await tx
      .insert(sales)
      .values({
        userId,
        totalAmount: totalAmount.toString(),
        status: "completed",
      })
      .returning({ id: sales.id });

    if (!sale) {
      throw new Error("Failed to create sale record");
    }

    // 2. Process each sale item
    for (const item of items) {
      if (item.isSerialized && !item.productItemId) {
        throw new Error(
          `Cannot sell serialized product "${item.productId}" without serial number (productItemId)`,
        );
      }

      // Insert sale detail
      await tx.insert(saleDetails).values({
        saleId: sale.id,
        productId: item.productId,
        productItemId: item.productItemId || null, // Allow null for non-serialized
        price: item.price.toString(),
      });

      // If product is serialized, update the product item status to 'sold'
      if (item.isSerialized && item.productItemId) {
        await tx
          .update(productItems)
          .set({ status: "sold" })
          .where(eq(productItems.id, item.productItemId));
      }

      // Create inventory OUT movement
      await tx.insert(inventoryMovements).values({
        productItemId: item.productItemId || null,
        productId: item.productId,
        type: "OUT",
        quantity: item.quantity,
        unitCost: item.price.toString(), // Approximated as sale price for now or needs COGS logic
        reason: `Sale #${sale.id}`,
      });
    }

    return { success: true, saleId: sale.id };
  });
};
