import { InventoryKPIs } from "@/components/inventory/inventory-kpis";
import { StockTable } from "@/components/inventory/stock-table";
import { AddStockSheet } from "@/components/inventory/add-stock-sheet";
import { InventorySearch } from "@/components/inventory/inventory-search";
import { getProducts } from "@/services/product-service";
import {
  getInventoryStats,
  getStockSummary,
  searchInventoryStock,
} from "@/services/inventory-service";

interface InventoryPageProps {
  searchParams: Promise<{ query?: string }>;
}

export default async function InventoryPage({
  searchParams,
}: InventoryPageProps) {
  const { query } = await searchParams;

  const products = await getProducts();
  const stats = await getInventoryStats();
  // Fetch specific stock data if a query exists, otherwise grab all items
  const stock = query
    ? await searchInventoryStock(query)
    : await getStockSummary();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Gestión de Bodega
          </h1>
          <p className="text-muted-foreground">
            Control de existencias y entradas de mercancía
          </p>
        </div>
        <div className="flex items-center gap-2">
          <InventorySearch />
          <AddStockSheet products={products} />
        </div>
      </div>

      {/* KPI Cards */}
      <InventoryKPIs stats={stats} />

      {/* Stock Table */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Existencias</h2>
        <StockTable stock={stock} />
      </div>
    </div>
  );
}
