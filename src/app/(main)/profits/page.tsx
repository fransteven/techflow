import { getProfitsDataAction } from "@/app/actions/profits-actions";
import { ProfitsKPIs } from "@/components/profits/profits-kpis";
import { OwnerPayoutsTable } from "@/components/profits/owner-payouts-table";
import { SellerCommissionsTable } from "@/components/profits/seller-commissions-table";
import { MonthPicker } from "@/components/profits/month-picker";
import { PageHeader } from "@/components/ui/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, PiggyBank } from "lucide-react";

interface ProfitsPageProps {
  searchParams: Promise<{ from?: string; to?: string }>;
}

export default async function ProfitsPage({ searchParams }: ProfitsPageProps) {
  const { from, to } = await searchParams;
  const { success, data, error } = await getProfitsDataAction(from, to);

  if (!success || !data) {
    return (
      <div className="container mx-auto space-y-8 p-8">
        <h1 className="text-3xl font-bold tracking-tight">Ganancias</h1>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Error al cargar el reporte: {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const { kpis, ownerPayouts, sellerCommissions } = data;

  return (
    <div className="container mx-auto space-y-8 p-8">
      <PageHeader
        title="Ganancias"
        description="Distribución de utilidades entre Masterplay, propietarios y vendedores."
        icon={PiggyBank}
        actions={<MonthPicker from={from} to={to} />}
      />

      <ProfitsKPIs kpis={kpis} />

      <div className="grid gap-6 lg:grid-cols-2">
        <OwnerPayoutsTable data={ownerPayouts} />
        <SellerCommissionsTable data={sellerCommissions} />
      </div>
    </div>
  );
}
