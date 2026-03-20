import { db } from "@/db";
import { importCosts } from "@/db/schema/imports";
import { products } from "@/db/schema/inventory";
import { user } from "@/db/schema/auth";
import { desc, eq, and, gte, lte, avg, sum, count, SQL } from "drizzle-orm";
import { CreateImportCostInput } from "@/lib/validators/import-cost-validator";

const MASTERCARD_COMMISSION_RATE = 0.0045;

export type ImportCostWithDetails = Awaited<
  ReturnType<typeof getImportCosts>
>[number];

export const getImportCosts = async (filters?: {
  status?: string;
  productId?: string;
  from?: Date;
  to?: Date;
}) => {
  const conditions: SQL[] = [];

  if (filters?.status) {
    conditions.push(eq(importCosts.status, filters.status));
  }
  if (filters?.productId) {
    conditions.push(eq(importCosts.productId, filters.productId));
  }
  if (filters?.from) {
    conditions.push(gte(importCosts.purchaseDate, filters.from));
  }
  if (filters?.to) {
    conditions.push(lte(importCosts.purchaseDate, filters.to));
  }

  return await db
    .select({
      id: importCosts.id,
      purchaseDate: importCosts.purchaseDate,
      condition: importCosts.condition,
      provider: importCosts.provider,
      status: importCosts.status,
      baseUsdCost: importCosts.baseUsdCost,
      useMastercardNu: importCosts.useMastercardNu,
      mastercardCommissionRate: importCosts.mastercardCommissionRate,
      mastercardDollarRate: importCosts.mastercardDollarRate,
      mastercardCommissionPesos: importCosts.mastercardCommissionPesos,
      casilleroUsdCost: importCosts.casilleroUsdCost,
      casilleroTrm: importCosts.casilleroTrm,
      casilleroPesos: importCosts.casilleroPesos,
      productTrm: importCosts.productTrm,
      productPesos: importCosts.productPesos,
      customsTariffPesos: importCosts.customsTariffPesos,
      totalCostPesos: importCosts.totalCostPesos,
      specs: importCosts.specs,
      notes: importCosts.notes,
      createdAt: importCosts.createdAt,
      productId: importCosts.productId,
      productItemId: importCosts.productItemId,
      productName: products.name,
      catalogPrice: products.price,
      userName: user.name,
    })
    .from(importCosts)
    .leftJoin(products, eq(importCosts.productId, products.id))
    .leftJoin(user, eq(importCosts.userId, user.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(importCosts.purchaseDate));
};

export const getImportCostById = async (id: string) => {
  const result = await db
    .select({
      id: importCosts.id,
      purchaseDate: importCosts.purchaseDate,
      condition: importCosts.condition,
      provider: importCosts.provider,
      status: importCosts.status,
      baseUsdCost: importCosts.baseUsdCost,
      useMastercardNu: importCosts.useMastercardNu,
      mastercardCommissionRate: importCosts.mastercardCommissionRate,
      mastercardDollarRate: importCosts.mastercardDollarRate,
      mastercardCommissionPesos: importCosts.mastercardCommissionPesos,
      casilleroUsdCost: importCosts.casilleroUsdCost,
      casilleroTrm: importCosts.casilleroTrm,
      casilleroPesos: importCosts.casilleroPesos,
      productTrm: importCosts.productTrm,
      productPesos: importCosts.productPesos,
      customsTariffPesos: importCosts.customsTariffPesos,
      totalCostPesos: importCosts.totalCostPesos,
      specs: importCosts.specs,
      notes: importCosts.notes,
      createdAt: importCosts.createdAt,
      productName: products.name,
      catalogPrice: products.price,
    })
    .from(importCosts)
    .leftJoin(products, eq(importCosts.productId, products.id))
    .where(eq(importCosts.id, id))
    .limit(1);

  return result[0] ?? null;
};

export const createImportCost = async (
  data: CreateImportCostInput & { userId: string },
) => {
  // Compute derived fields
  const mastercardCommissionPesos =
    data.useMastercardNu && data.mastercardDollarRate
      ? data.baseUsdCost * MASTERCARD_COMMISSION_RATE * data.mastercardDollarRate
      : 0;

  const casilleroPesos = data.casilleroUsdCost * data.casilleroTrm;
  const productPesos = data.baseUsdCost * data.productTrm;
  const customsTariffPesos = data.customsTariffPesos ?? 0;
  const totalCostPesos =
    mastercardCommissionPesos + casilleroPesos + productPesos + customsTariffPesos;

  const result = await db
    .insert(importCosts)
    .values({
      productId: data.productId,
      productItemId: data.productItemId ?? null,
      purchaseDate: data.purchaseDate,
      condition: data.condition,
      provider: data.provider ?? null,
      status: data.status,
      baseUsdCost: data.baseUsdCost.toString(),
      useMastercardNu: data.useMastercardNu,
      mastercardCommissionRate: data.useMastercardNu
        ? MASTERCARD_COMMISSION_RATE.toString()
        : null,
      mastercardDollarRate: data.mastercardDollarRate?.toString() ?? null,
      mastercardCommissionPesos: mastercardCommissionPesos.toString(),
      casilleroUsdCost: data.casilleroUsdCost.toString(),
      casilleroTrm: data.casilleroTrm.toString(),
      casilleroPesos: casilleroPesos.toString(),
      productTrm: data.productTrm.toString(),
      productPesos: productPesos.toString(),
      customsTariffPesos: customsTariffPesos.toString(),
      totalCostPesos: totalCostPesos.toString(),
      specs: data.specs ?? null,
      notes: data.notes ?? null,
      userId: data.userId,
    })
    .returning();

  return result[0];
};

export const getImportCostStats = async () => {
  const statsResult = await db
    .select({
      totalRecords: count(importCosts.id),
      totalInvestedCOP: sum(importCosts.totalCostPesos),
      avgProductTrm: avg(importCosts.productTrm),
      avgCasilleroTrm: avg(importCosts.casilleroTrm),
    })
    .from(importCosts)
    .where(eq(importCosts.status, "comprado"));

  const pendingResult = await db
    .select({ pendingCount: count(importCosts.id) })
    .from(importCosts)
    .where(eq(importCosts.status, "cotizacion"));

  return {
    totalRecords: statsResult[0]?.totalRecords ?? 0,
    totalInvestedCOP: parseFloat(statsResult[0]?.totalInvestedCOP ?? "0"),
    avgProductTrm: parseFloat(statsResult[0]?.avgProductTrm ?? "0"),
    avgCasilleroTrm: parseFloat(statsResult[0]?.avgCasilleroTrm ?? "0"),
    pendingQuotes: pendingResult[0]?.pendingCount ?? 0,
  };
};
