"use client";

import { useState } from "react";
import { InventoryKPIsUI } from "@/components/inventory-ui/inventory-kpis-ui";
import { StockTableUI } from "@/components/inventory-ui/stock-table-ui";
import { ProductDetailSheetUI } from "@/components/inventory-ui/product-detail-sheet-ui";
import { Warehouse } from "lucide-react";

export default function InventoryUIDemoPage() {
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleViewDetail = (productId: string) => {
    console.log("[v0] Opening detail for product:", productId);
    setSheetOpen(true);
  };

  return (
    <div className="min-h-screen">
      <div className="space-y-6 md:space-y-8 p-4 md:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Warehouse className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                Gestión de Inventario
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Control de existencias y entradas de mercancía
              </p>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <InventoryKPIsUI />

        {/* Stock Table */}
        <StockTableUI onViewDetail={handleViewDetail} />

        {/* Product Detail Sheet */}
        <ProductDetailSheetUI open={sheetOpen} onOpenChange={setSheetOpen} />
      </div>
    </div>
  );
}
