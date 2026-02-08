import { getSalesDataAction } from "@/app/actions/sales-actions";
import { SalesKPIs } from "@/components/sales/sales-kpis";
import { SalesTable } from "@/components/sales/sales-table";

export default async function SalesPage() {
  const { success, data, error } = await getSalesDataAction();

  if (!success || !data) {
    return (
      <div className="p-8">
        <div className="rounded-md bg-destructive/15 p-4 text-destructive">
          Error al cargar ventas: {error}
        </div>
      </div>
    );
  }

  const { sales, kpis } = data;

  return (
    <div className="container mx-auto space-y-8 p-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Ventas</h2>
        <p className="text-muted-foreground">
          Historial de ventas y rendimiento del negocio.
        </p>
      </div>

      <SalesKPIs kpis={kpis} />

      <SalesTable data={sales} />
    </div>
  );
}
