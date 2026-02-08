"use server";

import { revalidatePath } from "next/cache";
import {
  receiveStock,
  getInventoryItems,
  getInventoryMovements,
  getProductSerials,
} from "@/services/inventory-service";
import { receiveStockSchema } from "@/lib/validators/inventory-validator";

export async function receiveStockAction(data: unknown) {
  const result = receiveStockSchema.safeParse(data);

  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0].message,
    };
  }

  try {
    await receiveStock({
      productId: result.data.productId,
      quantity: result.data.quantity,
      unitCost: result.data.unitCost,
      serials: result.data.serials,
    });

    revalidatePath("/inventory");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Stock received successfully",
    };
  } catch (error) {
    console.error("Error receiving stock:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to receive stock",
    };
  }
}

export async function getInventoryItemsAction() {
  try {
    const items = await getInventoryItems();
    return { success: true, data: items };
  } catch (error) {
    console.error("Error fetching inventory items:", error);
    return { success: false, error: "Failed to fetch inventory items" };
  }
}

export async function getInventoryMovementsAction() {
  try {
    const movements = await getInventoryMovements();
    return { success: true, data: movements };
  } catch (error) {
    console.error("Error fetching inventory movements:", error);
    return { success: false, error: "Failed to fetch inventory movements" };
  }
}

export async function getProductSerialsAction(productId: string) {
  try {
    const serials = await getProductSerials(productId);
    return { success: true, data: serials };
  } catch (error) {
    console.error("Error fetching product serials:", error);
    return { success: false, error: "Failed to fetch product serials" };
  }
}
