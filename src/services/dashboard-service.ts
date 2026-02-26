import { db } from "@/db";
import { sales, user, products, reservations, productItems } from "@/db/schema";
import { eq, desc, sum, count, sql, and, gte, lt } from "drizzle-orm";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";

export async function getDashboardKPIs() {
  const now = new Date();

  // Rango Mes Actual
  const currentMonthStart = startOfMonth(now);
  const currentMonthEnd = endOfMonth(now);

  // Rango Mes Pasado
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthEnd = endOfMonth(subMonths(now, 1));

  // 1. Ventas Totales (Current vs Last Month)
  const currentSalesData = await db
    .select({ total: sum(sales.totalAmount) })
    .from(sales)
    .where(
      and(
        eq(sales.status, "completed"),
        gte(sales.createdAt, currentMonthStart),
        lt(sales.createdAt, currentMonthEnd),
      ),
    );

  const lastSalesData = await db
    .select({ total: sum(sales.totalAmount) })
    .from(sales)
    .where(
      and(
        eq(sales.status, "completed"),
        gte(sales.createdAt, lastMonthStart),
        lt(sales.createdAt, lastMonthEnd),
      ),
    );

  const totalSalesCurrent = Number(currentSalesData[0]?.total || 0);
  const totalSalesLast = Number(lastSalesData[0]?.total || 0);

  let salesGrowth = 0;
  if (totalSalesLast > 0) {
    salesGrowth = ((totalSalesCurrent - totalSalesLast) / totalSalesLast) * 100;
  } else if (totalSalesCurrent > 0) {
    salesGrowth = 100;
  }

  // 2. Reservas Activas
  const reservationsData = await db
    .select({ count: count() })
    .from(reservations)
    .where(eq(reservations.status, "active"));

  const currentReservations = Number(reservationsData[0]?.count || 0);

  // 3. Total Productos
  const productsData = await db.select({ count: count() }).from(products);

  const totalProducts = Number(productsData[0]?.count || 0);

  // 4. Por Retirar (Stock reservado pero no entregado aún)
  // Usaremos productItems con status 'reserved' como la métrica más precisa para "por retirar"
  const pendingPickupsData = await db
    .select({ count: count() })
    .from(productItems)
    .where(eq(productItems.status, "reserved"));

  const pendingPickups = Number(pendingPickupsData[0]?.count || 0);

  return {
    sales: {
      total: totalSalesCurrent,
      growth: parseFloat(salesGrowth.toFixed(1)),
    },
    reservations: {
      active: currentReservations,
    },
    products: {
      total: totalProducts,
    },
    pickups: {
      pending: pendingPickups,
    },
  };
}

export async function getRecentSales(limit = 5) {
  const recentSales = await db
    .select({
      id: sales.id,
      totalAmount: sales.totalAmount,
      createdAt: sales.createdAt,
      userId: sales.userId,
      userName: user.name,
      userEmail: user.email,
    })
    .from(sales)
    .leftJoin(user, eq(sales.userId, user.id))
    .orderBy(desc(sales.createdAt))
    .limit(limit);

  return recentSales.map((sale) => ({
    ...sale,
    customerName: sale.userName || "Cliente Genérico",
    customerEmail: sale.userEmail || "Venta en tienda",
    totalAmount: Number(sale.totalAmount),
  }));
}
