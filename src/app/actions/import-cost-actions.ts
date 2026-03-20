"use server";

import { revalidatePath } from "next/cache";
import { createImportCostSchema } from "@/lib/validators/import-cost-validator";
import * as importCostService from "@/services/import-cost-service";
import * as productService from "@/services/product-service";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function createImportCostAction(data: unknown) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { success: false, error: "No autorizado" };
  }

  const result = createImportCostSchema.safeParse(data);

  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  try {
    const record = await importCostService.createImportCost({
      ...result.data,
      userId: session.user.id,
    });
    revalidatePath("/import-costs");
    return { success: true, data: record };
  } catch (error) {
    console.error("Error creating import cost:", error);
    return { success: false, error: "Error al registrar el costeo" };
  }
}

export async function getImportCostsAction(filters?: {
  status?: string;
  productId?: string;
  from?: string;
  to?: string;
}) {
  try {
    const parsedFilters = {
      status: filters?.status,
      productId: filters?.productId,
      from: filters?.from ? new Date(filters.from) : undefined,
      to: filters?.to ? new Date(filters.to) : undefined,
    };

    const [importCostsList, stats, products] = await Promise.all([
      importCostService.getImportCosts(parsedFilters),
      importCostService.getImportCostStats(),
      productService.getProducts(),
    ]);

    return {
      success: true,
      data: { importCosts: importCostsList, stats, products },
    };
  } catch (error) {
    console.error("Error fetching import costs:", error);
    return { success: false, error: "Error al cargar los costeos" };
  }
}

export async function getImportCostByIdAction(id: string) {
  try {
    const record = await importCostService.getImportCostById(id);
    if (!record) {
      return { success: false, error: "Registro no encontrado" };
    }
    return { success: true, data: record };
  } catch (error) {
    console.error("Error fetching import cost:", error);
    return { success: false, error: "Error al cargar el costeo" };
  }
}
