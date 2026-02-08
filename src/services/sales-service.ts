import { db } from "@/db";
import {
  sales,
  saleDetails,
  inventoryMovements,
  expenses,
  user,
} from "@/db/schema";
import { sql, desc, and, gte, lte, eq } from "drizzle-orm";
import { startOfMonth, endOfMonth } from "date-fns";

export const getSales = async () => {
  return await db
    .select({
      id: sales.id,
      totalAmount: sales.totalAmount,
      status: sales.status,
      date: sales.createdAt,
      userName: user.name,
    })
    .from(sales)
    .leftJoin(user, eq(sales.userId, user.id))
    .orderBy(desc(sales.createdAt));
};

export const getSalesKPIs = async () => {
  const now = new Date();
  const start = startOfMonth(now);
  const end = endOfMonth(now);

  // 1. Total Income (Revenue) for current month
  const revenueResult = await db
    .select({
      total: sql<number>`COALESCE(SUM(${sales.totalAmount}), 0)`,
    })
    .from(sales)
    .where(and(gte(sales.createdAt, start), lte(sales.createdAt, end)));

  // 2. Inventory Value Sold (COGS approx) for current month
  // Note: relying on inventoryMovements type='OUT'
  const cogsResult = await db
    .select({
      total: sql<number>`COALESCE(SUM(${inventoryMovements.quantity} * ${inventoryMovements.unitCost}), 0)`,
    })
    .from(inventoryMovements)
    .where(
      and(
        eq(inventoryMovements.type, "OUT"),
        gte(inventoryMovements.createdAt, start),
        lte(inventoryMovements.createdAt, end),
      ),
    );

  // 3. Total Expenses for current month
  const expensesResult = await db
    .select({
      total: sql<number>`COALESCE(SUM(${expenses.amount}), 0)`,
    })
    .from(expenses)
    .where(and(gte(expenses.date, start), lte(expenses.date, end)));

  return {
    monthlyRevenue: Number(revenueResult[0].total),
    monthlyInventoryValueSold: Number(cogsResult[0].total),
    monthlyExpenses: Number(expensesResult[0].total),
  };
};
