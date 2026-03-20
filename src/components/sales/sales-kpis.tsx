import { KpiCard } from "@/components/ui/kpi-card";
import { DollarSign, Package, TrendingDown, TrendingUp } from "lucide-react";

interface SalesKPIsProps {
  kpis: {
    monthlyRevenue: number;
    monthlyInventoryValueSold: number;
    monthlyExpenses: number;
  };
}

const fmt = (amount: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount);

export function SalesKPIs({ kpis }: SalesKPIsProps) {
  const { monthlyRevenue, monthlyInventoryValueSold, monthlyExpenses } = kpis;
  const operatingIncome = monthlyRevenue - monthlyExpenses;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        icon={DollarSign}
        title="Ingresos Totales (Mes)"
        value={fmt(monthlyRevenue)}
        description="Ventas registradas este mes"
      />
      <KpiCard
        icon={Package}
        title="Valor Inventario Movido"
        value={fmt(monthlyInventoryValueSold)}
        description="Costo de mercancía vendida (aprox.)"
      />
      <KpiCard
        icon={TrendingDown}
        title="Gastos Operativos"
        value={fmt(monthlyExpenses)}
        description="Salidas de dinero registradas"
      />
      <KpiCard
        icon={TrendingUp}
        title="Flujo de Caja Operativo"
        value={fmt(operatingIncome)}
        valueClassName={operatingIncome >= 0 ? "text-green-600" : "text-red-600"}
        description="Ingresos - Gastos (Sin incluir costo venta)"
      />
    </div>
  );
}
