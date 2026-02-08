import { InventoryKPIs } from "@/components/inventory/inventory-kpis";
import { StockTable } from "@/components/inventory/stock-table";
import { AddStockSheet } from "@/components/inventory/add-stock-sheet";
import { getProducts } from "@/services/product-service";
import {
  getInventoryStats,
  getStockSummary,
} from "@/services/inventory-service";

export default async function InventoryPage() {
  const products = await getProducts();
  const stats = await getInventoryStats();
  const stock = await getStockSummary();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Gestión de Bodega
          </h1>
          <p className="text-muted-foreground">
            Control de existencias y entradas de mercancía
          </p>
        </div>
        <AddStockSheet products={products} />
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
