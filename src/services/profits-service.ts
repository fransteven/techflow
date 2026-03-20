import { db } from "@/db";
import {
  sales,
  saleDetails,
  productItems,
  owners,
  expenses,
  user,
} from "@/db/schema";
import { sql, and, gte, lte, eq, isNull, isNotNull } from "drizzle-orm";
import { startOfMonth, endOfMonth } from "date-fns";

type DateRange = { from: Date; to: Date };

export function getDefaultDateRange(): DateRange {
  const now = new Date();
  return { from: startOfMonth(now), to: endOfMonth(now) };
}

export const getProfitsKPIs = async (range?: DateRange) => {
  const { from, to } = range ?? getDefaultDateRange();

  // Single query with conditional aggregation over ownerType
  // productItemId IS NULL = non-serialized item = always masterplay
  const profitsResult = await db
    .select({
      masterplayOwnProfit: sql<number>`
        COALESCE(SUM(
          CASE
            WHEN ${saleDetails.productItemId} IS NULL
              THEN CAST(${saleDetails.price} AS DECIMAL) - CAST(${saleDetails.unitCost} AS DECIMAL)
            WHEN ${productItems.ownerType} = 'masterplay'
              THEN CAST(${saleDetails.price} AS DECIMAL) - CAST(${saleDetails.unitCost} AS DECIMAL)
            ELSE 0
          END
        ), 0)`,
      masterplayCommission: sql<number>`
        COALESCE(SUM(
          CASE
            WHEN ${productItems.ownerType} = 'consignment'
              THEN CAST(${saleDetails.commissionAmount} AS DECIMAL)
            ELSE 0
          END
        ), 0)`,
      totalOwnerPayouts: sql<number>`
        COALESCE(SUM(
          CASE
            WHEN ${productItems.ownerType} = 'consignment'
              THEN (CAST(${saleDetails.price} AS DECIMAL) - CAST(${saleDetails.unitCost} AS DECIMAL)) * 0.5
            ELSE 0
          END
        ), 0)`,
      totalSellerCommissions: sql<number>`
        COALESCE(SUM(
          CASE
            WHEN ${productItems.ownerType} = 'consignment'
              THEN (CAST(${saleDetails.price} AS DECIMAL) - CAST(${saleDetails.unitCost} AS DECIMAL)) * 0.1
            ELSE 0
          END
        ), 0)`,
      totalRevenue: sql<number>`
        COALESCE(SUM(CAST(${saleDetails.price} AS DECIMAL)), 0)`,
    })
    .from(saleDetails)
    .innerJoin(sales, eq(saleDetails.saleId, sales.id))
    .leftJoin(productItems, eq(saleDetails.productItemId, productItems.id))
    .where(
      and(
        eq(sales.status, "completed"),
        gte(sales.createdAt, from),
        lte(sales.createdAt, to),
      ),
    );

  const expensesResult = await db
    .select({
      total: sql<number>`COALESCE(SUM(CAST(${expenses.amount} AS DECIMAL)), 0)`,
    })
    .from(expenses)
    .where(and(gte(expenses.date, from), lte(expenses.date, to)));

  const masterplayOwnProfit = Number(profitsResult[0]?.masterplayOwnProfit ?? 0);
  const masterplayCommission = Number(profitsResult[0]?.masterplayCommission ?? 0);
  const totalMasterplayProfit = masterplayOwnProfit + masterplayCommission;
  const totalOwnerPayouts = Number(profitsResult[0]?.totalOwnerPayouts ?? 0);
  const totalSellerCommissions = Number(profitsResult[0]?.totalSellerCommissions ?? 0);
  const totalExpenses = Number(expensesResult[0]?.total ?? 0);
  const totalRevenue = Number(profitsResult[0]?.totalRevenue ?? 0);

  return {
    masterplayOwnProfit,
    masterplayCommission,
    totalMasterplayProfit,
    totalOwnerPayouts,
    totalSellerCommissions,
    totalExpenses,
    netProfit: totalMasterplayProfit - totalExpenses,
    grossMarginPct: totalRevenue > 0 ? (totalMasterplayProfit / totalRevenue) * 100 : 0,
  };
};

export const getOwnerPayouts = async (range?: DateRange) => {
  const { from, to } = range ?? getDefaultDateRange();

  const rows = await db
    .select({
      ownerId: productItems.ownerId,
      ownerName: owners.name,
      saleCount: sql<number>`COUNT(${saleDetails.id})`,
      totalRevenue: sql<number>`COALESCE(SUM(CAST(${saleDetails.price} AS DECIMAL)), 0)`,
      totalCost: sql<number>`COALESCE(SUM(CAST(${saleDetails.unitCost} AS DECIMAL)), 0)`,
      masterplayShare: sql<number>`COALESCE(SUM(CAST(${saleDetails.commissionAmount} AS DECIMAL)), 0)`,
    })
    .from(saleDetails)
    .innerJoin(sales, eq(saleDetails.saleId, sales.id))
    .innerJoin(
      productItems,
      and(
        eq(saleDetails.productItemId, productItems.id),
        eq(productItems.ownerType, "consignment"),
      ),
    )
    .innerJoin(owners, eq(productItems.ownerId, owners.id))
    .where(
      and(
        eq(sales.status, "completed"),
        gte(sales.createdAt, from),
        lte(sales.createdAt, to),
        isNotNull(saleDetails.productItemId),
      ),
    )
    .groupBy(productItems.ownerId, owners.name);

  return rows.map((row) => {
    const totalRevenue = Number(row.totalRevenue);
    const totalCost = Number(row.totalCost);
    const grossProfit = totalRevenue - totalCost;
    return {
      ownerId: row.ownerId ?? "",
      ownerName: row.ownerName,
      saleCount: Number(row.saleCount),
      totalRevenue,
      totalCost,
      grossProfit,
      ownerPayout: grossProfit * 0.5,
      masterplayShare: Number(row.masterplayShare),
    };
  });
};

export const getSellerCommissions = async (range?: DateRange) => {
  const { from, to } = range ?? getDefaultDateRange();

  const rows = await db
    .select({
      userId: sales.userId,
      sellerName: user.name,
      saleCount: sql<number>`COUNT(${saleDetails.id})`,
      totalConsignmentRevenue: sql<number>`COALESCE(SUM(CAST(${saleDetails.price} AS DECIMAL)), 0)`,
      totalCommission: sql<number>`
        COALESCE(SUM(
          (CAST(${saleDetails.price} AS DECIMAL) - CAST(${saleDetails.unitCost} AS DECIMAL)) * 0.1
        ), 0)`,
    })
    .from(saleDetails)
    .innerJoin(sales, eq(saleDetails.saleId, sales.id))
    .innerJoin(
      productItems,
      and(
        eq(saleDetails.productItemId, productItems.id),
        eq(productItems.ownerType, "consignment"),
      ),
    )
    .leftJoin(user, eq(sales.userId, user.id))
    .where(
      and(
        eq(sales.status, "completed"),
        gte(sales.createdAt, from),
        lte(sales.createdAt, to),
        isNotNull(saleDetails.productItemId),
      ),
    )
    .groupBy(sales.userId, user.name);

  return rows.map((row) => ({
    userId: row.userId ?? "",
    sellerName: row.sellerName ?? "Sistema",
    saleCount: Number(row.saleCount),
    totalConsignmentRevenue: Number(row.totalConsignmentRevenue),
    totalCommission: Number(row.totalCommission),
  }));
};

export type ProfitsKPIs = Awaited<ReturnType<typeof getProfitsKPIs>>;
export type OwnerPayout = Awaited<ReturnType<typeof getOwnerPayouts>>[number];
export type SellerCommission = Awaited<ReturnType<typeof getSellerCommissions>>[number];
