import { db } from "@/db";
import {
  products,
  productItems,
  inventoryMovements,
  sales,
  saleDetails,
} from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { ReceiveStockInput } from "@/lib/validators/inventory-validator";

export const receiveStock = async ({
  productId,
  quantity,
  unitCost,
  serials,
}: ReceiveStockInput) => {
  return await db.transaction(async (tx) => {
    // 1. Verificación: Consultar el producto
    const product = await tx.query.products.findFirst({
      where: eq(products.id, productId),
    });

    if (!product) {
      throw new Error(`Product with ID ${productId} not found`);
    }

    // 2. Validación de Integridad
    if (product.isSerialized) {
      if (!serials || serials.length !== quantity) {
        throw new Error(
          `Serialized product requires exactly ${quantity} serial numbers. Provided: ${
            serials?.length || 0
          }`,
        );
      }
    }

    // 3. Ejecución
    if (product.isSerialized && serials) {
      // Caso Serializado
      for (const serial of serials) {
        // Insertar product item
        const [newItem] = await tx
          .insert(productItems)
          .values({
            productId,
            serialNumber: serial,
            status: "available",
          })
          .returning({ id: productItems.id });

        // Insertar movimiento de inventario
        await tx.insert(inventoryMovements).values({
          productItemId: newItem.id,
          productId,
          type: "IN",
          quantity: 1,
          unitCost: unitCost.toString(),
          reason: "Stock Received",
        });
      }
    } else {
      // Caso NO Serializado
      await tx.insert(inventoryMovements).values({
        productItemId: null,
        productId,
        type: "IN",
        quantity,
        unitCost: unitCost.toString(),
        reason: "Stock Received",
      });
    }

    return { success: true };
  });
};

export const getInventoryItems = async () => {
  return await db
    .select({
      id: productItems.id,
      serial: productItems.serialNumber,
      sku: productItems.sku,
      status: productItems.status,
      createdAt: productItems.createdAt,
      productName: products.name,
      productId: products.id,
      soldDate: sales.createdAt,
    })
    .from(productItems)
    .leftJoin(products, eq(productItems.productId, products.id))
    .leftJoin(saleDetails, eq(productItems.id, saleDetails.productItemId))
    .leftJoin(sales, eq(saleDetails.saleId, sales.id))
    .orderBy(desc(productItems.createdAt));
};

export const getInventoryMovements = async () => {
  return await db
    .select({
      id: inventoryMovements.id,
      type: inventoryMovements.type,
      quantity: inventoryMovements.quantity,
      reason: inventoryMovements.reason,
      createdAt: inventoryMovements.createdAt,
      unitCost: inventoryMovements.unitCost,
      productName: products.name,
      productId: products.id,
      serialNumber: productItems.serialNumber,
      productItemId: inventoryMovements.productItemId,
    })
    .from(inventoryMovements)
    .leftJoin(products, eq(inventoryMovements.productId, products.id))
    .leftJoin(
      productItems,
      eq(inventoryMovements.productItemId, productItems.id),
    )
    .orderBy(desc(inventoryMovements.createdAt));
};

export const getInventoryStats = async () => {
  // Calculate total inventory value (sum of IN movements)
  const valueResult = await db
    .select({
      totalValue: sql<string>`CAST(SUM(CAST(${inventoryMovements.unitCost} AS DECIMAL) * ${inventoryMovements.quantity}) AS DECIMAL)`,
    })
    .from(inventoryMovements)
    .where(eq(inventoryMovements.type, "IN"));

  // Calculate total units (count available product items + sum of non-serialized IN - OUT)
  const serializedUnits = await db
    .select({
      count: sql<string>`COUNT(*)`,
    })
    .from(productItems)
    .where(eq(productItems.status, "available"));

  const nonSerializedUnits = await db
    .select({
      total: sql<string>`SUM(CASE WHEN ${inventoryMovements.type} = 'IN' THEN ${inventoryMovements.quantity} ELSE -${inventoryMovements.quantity} END)`,
    })
    .from(inventoryMovements)
    .where(sql`${inventoryMovements.productItemId} IS NULL`);

  // Convert to numbers explicitly to avoid string concatenation
  const serializedCount = Number(serializedUnits[0]?.count || 0);
  const nonSerializedCount = Number(nonSerializedUnits[0]?.total || 0);
  const totalUnits = serializedCount + nonSerializedCount;

  // Count products with low stock (stock < 5)
  const stockByProduct = await db
    .select({
      productId: inventoryMovements.productId,
      totalStock: sql<string>`SUM(CASE WHEN ${inventoryMovements.type} = 'IN' THEN ${inventoryMovements.quantity} ELSE -${inventoryMovements.quantity} END)`,
    })
    .from(inventoryMovements)
    .groupBy(inventoryMovements.productId);

  const lowStockCount = stockByProduct.filter(
    (p) => Number(p.totalStock || 0) < 5,
  ).length;

  return {
    totalValue: Number(valueResult[0]?.totalValue || 0),
    totalUnits,
    lowStockCount,
  };
};

export const getStockSummary = async () => {
  const stockData = await db
    .select({
      productId: products.id,
      productName: products.name,
      isSerialized: products.isSerialized,
      totalIn: sql<number>`COALESCE(SUM(CASE WHEN ${inventoryMovements.type} = 'IN' THEN ${inventoryMovements.quantity} ELSE 0 END), 0)`,
      totalOut: sql<number>`COALESCE(SUM(CASE WHEN ${inventoryMovements.type} = 'OUT' THEN ${inventoryMovements.quantity} ELSE 0 END), 0)`,
      avgCost: sql<number>`COALESCE(AVG(CASE WHEN ${inventoryMovements.type} = 'IN' THEN CAST(${inventoryMovements.unitCost} AS DECIMAL) END), 0)`,
    })
    .from(products)
    .leftJoin(inventoryMovements, eq(products.id, inventoryMovements.productId))
    .groupBy(products.id, products.name, products.isSerialized);

  return stockData.map((item) => ({
    productId: item.productId,
    productName: item.productName,
    stockTotal: (item.totalIn || 0) - (item.totalOut || 0),
    avgCost: item.avgCost || 0,
    status: (item.totalIn || 0) - (item.totalOut || 0) < 5 ? "low" : "ok",
  }));
};

export const getProductSerials = async (productId: string) => {
  return await db
    .select({
      id: productItems.id,
      serialNumber: productItems.serialNumber,
      sku: productItems.sku,
      status: productItems.status,
      createdAt: productItems.createdAt,
    })
    .from(productItems)
    .where(eq(productItems.productId, productId))
    .orderBy(desc(productItems.createdAt));
};
