import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Package, TrendingDown, TrendingUp } from "lucide-react";

interface SalesKPIsProps {
  kpis: {
    monthlyRevenue: number;
    monthlyInventoryValueSold: number;
    monthlyExpenses: number;
  };
}

export function SalesKPIs({ kpis }: SalesKPIsProps) {
  const { monthlyRevenue, monthlyInventoryValueSold, monthlyExpenses } = kpis;

  // "Utilidad Neta del Mes" (Profit) = Revenue - Expenses - COGS (optional, depends on definition)
  // User asked for "Vital KPI" -> I'll use "Operating Income" (Ingresos - Gastos)
  // But strictly, Net Profit should also substract cost of goods.
  // Given the COGS issue, I will present "Ingresos vs Gastos" as the vital one.
  const operatingIncome = monthlyRevenue - monthlyExpenses;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Ingresos Totales (Mes)
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(monthlyRevenue)}
          </div>
          <p className="text-xs text-muted-foreground">
            Ventas registradas este mes
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Valor Inventario Movido
          </CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(monthlyInventoryValueSold)}
          </div>
          <p className="text-xs text-muted-foreground">
            Costo de mercancía vendida (aprox.)
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Gastos Operativos
          </CardTitle>
          <TrendingDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(monthlyExpenses)}
          </div>
          <p className="text-xs text-muted-foreground">
            Salidas de dinero registradas
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Flujo de Caja Operativo
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${operatingIncome >= 0 ? "text-green-600" : "text-red-600"}`}
          >
            {formatCurrency(operatingIncome)}
          </div>
          <p className="text-xs text-muted-foreground">
            Ingresos - Gastos (Sin incluir costo venta)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
