import { Package, DollarSign, AlertTriangle, TrendingUp } from "lucide-react";

// Dummy data estático
const kpiData = {
  totalItems: 1247,
  lowStock: 23,
  totalValue: 45892500,
  trends: {
    items: "+12%",
    lowStock: "-5%",
    value: "+8.2%",
  },
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

interface KPICardProps {
  title: string;
  value: string | number;
  description: string;
  trend?: string;
  trendDirection?: "up" | "down" | "neutral";
  icon: React.ReactNode;
  iconBgClass: string;
  iconColorClass: string;
  accentLine?: string;
}

function KPICard({
  title,
  value,
  description,
  trend,
  trendDirection = "neutral",
  icon,
  iconBgClass,
  iconColorClass,
  accentLine,
}: KPICardProps) {
  const trendColor =
    trendDirection === "up"
      ? "text-emerald-400"
      : trendDirection === "down"
        ? "text-rose-400"
        : "text-slate-400";

  return (
    <div className="group relative bg-card rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md">
      {/* Accent line superior */}
      {accentLine && (
        <div className={`absolute top-0 left-0 right-0 h-1 ${accentLine}`} />
      )}

      <div className="p-5 md:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0 space-y-3">
            <p className="text-sm font-medium text-muted-foreground truncate">
              {title}
            </p>

            <div className="flex items-baseline gap-3">
              <span className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
                {value}
              </span>
              {trend && (
                <span
                  className={`inline-flex items-center gap-1 text-xs font-semibold ${trendColor}`}
                >
                  <TrendingUp className="h-3 w-3" />
                  {trend}
                </span>
              )}
            </div>

            <p className="text-xs text-muted-foreground/80">{description}</p>
          </div>

          <div
            className={`flex-shrink-0 p-3 rounded-xl ${iconBgClass} transition-transform duration-200 group-hover:scale-105`}
          >
            <div className={iconColorClass}>{icon}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function InventoryKPIsUI() {
  return (
    <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {/* Total de Ítems */}
      <KPICard
        title="Total de Ítems"
        value={kpiData.totalItems.toLocaleString("es-CO")}
        description="Unidades disponibles en bodega"
        trend={kpiData.trends.items}
        trendDirection="up"
        icon={<Package className="h-5 w-5 md:h-6 md:w-6" />}
        iconBgClass="bg-blue-500/10 dark:bg-blue-500/20"
        iconColorClass="text-blue-500"
        accentLine="bg-gradient-to-r from-blue-500 to-blue-400"
      />

      {/* Bajo Stock */}
      <KPICard
        title="Bajo Stock"
        value={kpiData.lowStock}
        description={
          kpiData.lowStock > 0
            ? "Productos requieren reabastecimiento"
            : "Todos los productos con stock suficiente"
        }
        trend={kpiData.trends.lowStock}
        trendDirection="down"
        icon={<AlertTriangle className="h-5 w-5 md:h-6 md:w-6" />}
        iconBgClass={
          kpiData.lowStock > 0
            ? "bg-amber-500/10 dark:bg-amber-500/20"
            : "bg-slate-100 dark:bg-slate-800"
        }
        iconColorClass={kpiData.lowStock > 0 ? "text-amber-500" : "text-slate-400"}
        accentLine={
          kpiData.lowStock > 0
            ? "bg-gradient-to-r from-amber-500 to-orange-400"
            : "bg-slate-200 dark:bg-slate-700"
        }
      />

      {/* Valor Total */}
      <KPICard
        title="Valor Total"
        value={formatCurrency(kpiData.totalValue)}
        description="Valor de mercancía en inventario"
        trend={kpiData.trends.value}
        trendDirection="up"
        icon={<DollarSign className="h-5 w-5 md:h-6 md:w-6" />}
        iconBgClass="bg-emerald-500/10 dark:bg-emerald-500/20"
        iconColorClass="text-emerald-500"
        accentLine="bg-gradient-to-r from-emerald-500 to-teal-400"
      />
    </div>
  );
}
