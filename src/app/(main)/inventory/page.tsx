import { InventoryKPIs } from "@/components/inventory/inventory-kpis";
import { StockTable } from "@/components/inventory/stock-table";
import { AddStockSheet } from "@/components/inventory/add-stock-sheet";
import { InventorySearch } from "@/components/inventory/inventory-search";
import { PageHeader } from "@/components/ui/page-header";
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
  const stock = query
    ? await searchInventoryStock(query)
    : await getStockSummary();

  return (
    <div className="space-y-8 p-8">
      <PageHeader
        title="Gestión de Bodega"
        description="Control de existencias y entradas de mercancía"
        actions={<AddStockSheet products={products} />}
      />

      <InventoryKPIs stats={stats} />

      <StockTable
        stock={stock}
        searchSlot={<InventorySearch />}
      />
    </div>
  );
}
