"use server";

import * as profitsService from "@/services/profits-service";
import { parseISO, startOfMonth, endOfMonth } from "date-fns";

function parseDateRange(from?: string, to?: string) {
  const now = new Date();
  try {
    return {
      from: from ? parseISO(from) : startOfMonth(now),
      to: to ? parseISO(to) : endOfMonth(now),
    };
  } catch {
    return { from: startOfMonth(now), to: endOfMonth(now) };
  }
}

export async function getProfitsDataAction(from?: string, to?: string) {
  try {
    const range = parseDateRange(from, to);
    const [kpis, ownerPayouts, sellerCommissions] = await Promise.all([
      profitsService.getProfitsKPIs(range),
      profitsService.getOwnerPayouts(range),
      profitsService.getSellerCommissions(range),
    ]);
    return { success: true, data: { kpis, ownerPayouts, sellerCommissions } };
  } catch (error) {
    console.error("Error fetching profits data:", error);
    return { success: false, error: "Failed to fetch profits data" };
  }
}
