import { KpiCard } from "@/components/ui/kpi-card";
import {
  Store,
  HandshakeIcon,
  TrendingUp,
  Percent,
  Users,
  UserCheck,
  TrendingDown,
  CircleDollarSign,
} from "lucide-react";
import type { ProfitsKPIs } from "@/services/profits-service";

const fmt = (amount: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount);

interface ProfitsKPIsProps {
  kpis: ProfitsKPIs;
}

export function ProfitsKPIs({ kpis }: ProfitsKPIsProps) {
  const {
    masterplayOwnProfit,
    masterplayCommission,
    totalMasterplayProfit,
    totalOwnerPayouts,
    totalSellerCommissions,
    totalExpenses,
    netProfit,
    grossMarginPct,
  } = kpis;

  return (
    <div className="space-y-4">
      {/* Row 1: Masterplay earnings breakdown */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={Store}
          title="Utilidad Propia (Masterplay)"
          value={fmt(masterplayOwnProfit)}
          description="Ganancia de inventario propio"
        />
        <KpiCard
          icon={HandshakeIcon}
          title="Comisión Consignación (40%)"
          value={fmt(masterplayCommission)}
          description="Comisión sobre ventas de consignación"
        />
        <KpiCard
          icon={TrendingUp}
          title="Utilidad Bruta Masterplay"
          value={fmt(totalMasterplayProfit)}
          description="Propia + comisión consignación"
          valueClassName="text-green-600"
        />
        <KpiCard
          icon={Percent}
          title="Margen Bruto"
          value={`${grossMarginPct.toFixed(1)}%`}
          description="Sobre el total de ventas del período"
        />
      </div>

      {/* Row 2: Payouts & net result */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={Users}
          title="Pagos a Propietarios (50%)"
          value={fmt(totalOwnerPayouts)}
          description="Liquidación a consignatarios"
        />
        <KpiCard
          icon={UserCheck}
          title="Comisiones Vendedores (10%)"
          value={fmt(totalSellerCommissions)}
          description="Comisiones por ventas de consignación"
        />
        <KpiCard
          icon={TrendingDown}
          title="Gastos Operativos"
          value={fmt(totalExpenses)}
          description="Gastos registrados en el período"
        />
        <KpiCard
          icon={CircleDollarSign}
          title="Utilidad Neta Masterplay"
          value={fmt(netProfit)}
          description="Utilidad bruta menos gastos operativos"
          valueClassName={netProfit >= 0 ? "text-green-600" : "text-red-600"}
        />
      </div>
    </div>
  );
}
