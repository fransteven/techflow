import { KpiCard } from "@/components/ui/kpi-card";
import { DollarSign, TrendingUp, Clock } from "lucide-react";

interface ImportCostsKpisProps {
  stats: {
    totalRecords: number;
    totalInvestedCOP: number;
    avgProductTrm: number;
    avgCasilleroTrm: number;
    pendingQuotes: number;
  };
}

const formatCOP = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

const formatTRM = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

export function ImportCostsKpis({ stats }: ImportCostsKpisProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        icon={DollarSign}
        title="Total Invertido"
        value={formatCOP(stats.totalInvestedCOP)}
        description={`En ${stats.totalRecords} compras realizadas`}
      />
      <KpiCard
        icon={TrendingUp}
        title="TRM Promedio Producto"
        value={stats.avgProductTrm > 0 ? formatTRM(stats.avgProductTrm) : "—"}
        description="Dólar promedio al comprar equipos"
      />
      <KpiCard
        icon={TrendingUp}
        title="TRM Promedio Casillero"
        value={
          stats.avgCasilleroTrm > 0 ? formatTRM(stats.avgCasilleroTrm) : "—"
        }
        description="Dólar promedio al pagar casillero"
      />
      <KpiCard
        icon={Clock}
        title="Cotizaciones Pendientes"
        value={stats.pendingQuotes}
        description="Registros sin confirmar como compra"
        valueClassName={stats.pendingQuotes > 0 ? "text-amber-500" : undefined}
      />
    </div>
  );
}
