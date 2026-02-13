"use server";

import * as salesService from "@/services/sales-service";

export async function getSalesDataAction() {
  try {
    const sales = await salesService.getSales();
    const kpis = await salesService.getSalesKPIs();

    return {
      success: true,
      data: {
        sales,
        kpis,
      },
    };
  } catch (error) {
    console.error("Error fetching sales data:", error);
    return { success: false, error: "Failed to fetch sales data" };
  }
}

export async function getSaleDetailsAction(saleId: string) {
  try {
    const details = await salesService.getSaleDetails(saleId);
    return { success: true, data: details };
  } catch (error) {
    console.error("Error fetching sale details:", error);
    return { success: false, error: "Failed to fetch sale details" };
  }
}
