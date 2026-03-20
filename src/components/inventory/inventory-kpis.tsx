import { Package, DollarSign, AlertTriangle } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";

interface InventoryKPIsProps {
  stats: {
    totalValue: number;
    totalUnits: number;
    lowStockCount: number;
  };
}

export function InventoryKPIs({ stats }: InventoryKPIsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Valor Total del Inventario */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-slate-500">
            Valor Total del Inventario
          </span>
          <div className="bg-green-100 p-2 rounded-full">
            <DollarSign className="h-5 w-5 text-green-600" />
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-900">
          {formatCurrency(stats.totalValue)}
        </div>
        <p className="mt-1 text-xs text-slate-400 font-medium">
          Valor de mercancía en bodega
        </p>
      </div>

      {/* Unidades Totales */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-slate-500">
            Unidades Totales
          </span>
          <div className="bg-blue-100 p-2 rounded-full">
            <Package className="h-5 w-5 text-blue-600" />
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-900">
          {stats.totalUnits.toLocaleString("es-CO")}
        </div>
        <p className="mt-1 text-xs text-slate-400 font-medium">
          Productos disponibles en bodega
        </p>
      </div>

      {/* Productos Bajos de Stock */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-slate-500">
            Productos bajos de stock
          </span>
          <div className={`p-2 rounded-full ${stats.lowStockCount > 0 ? "bg-red-100" : "bg-slate-100"}`}>
            <AlertTriangle
              className={`h-5 w-5 ${stats.lowStockCount > 0 ? "text-red-600" : "text-slate-400"}`}
            />
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-900">
          {stats.lowStockCount}
        </div>
        {stats.lowStockCount > 0 ? (
          <p className="mt-1 text-xs text-red-600 font-semibold">
            Requiere atención inmediata
          </p>
        ) : (
          <p className="mt-1 text-xs text-slate-400 font-medium">
            Stock en buen nivel
          </p>
        )}
      </div>
    </div>
  );
}
