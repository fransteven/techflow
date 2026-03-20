import { getSalesDataAction } from "@/app/actions/sales-actions";
import { SalesKPIs } from "@/components/sales/sales-kpis";
import { SalesTable } from "@/components/sales/sales-table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";

export default async function SalesPage() {
  const { success, data, error } = await getSalesDataAction();

  if (!success || !data) {
    return (
      <div className="container mx-auto space-y-8 p-8">
        <h1 className="text-3xl font-bold tracking-tight">Ventas</h1>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Error al cargar ventas: {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const { sales, kpis } = data;

  return (
    <div className="container mx-auto space-y-8 p-8">
      <PageHeader
        title="Ventas"
        description="Historial de ventas y rendimiento del negocio."
      />

      <SalesKPIs kpis={kpis} />

      <SalesTable data={sales} />
    </div>
  );
}
