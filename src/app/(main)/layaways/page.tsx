import { getLayawaysAction } from "@/app/actions/layaway-actions";
import { LayawaysTable } from "@/components/layaways/layaways-table";
import { Clock } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function LayawaysPage() {
  const response = await getLayawaysAction();

  if (!response.success) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Apartados (Layaways)</h1>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {response.error || "No se pudieron cargar los apartados."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const layaways = response.data || [];
  
  // KPI simples
  const activeCount = layaways.filter(l => l.status === "active" && l.balance > 0).length;
  const totalPending = layaways
    .filter(l => l.status === "active")
    .reduce((sum, l) => sum + l.balance, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Clock className="h-8 w-8 text-primary" />
            Apartados
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestiona los artículos reservados, recibe abonos y controla los vencimientos.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Apartados Activos</h3>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{activeCount}</div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Saldo por Cobrar</h3>
            <span className="text-lg font-bold text-amber-500">$</span>
          </div>
          <div className="text-2xl font-bold text-primary">
            {new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(totalPending)}
          </div>
        </div>
      </div>

      <LayawaysTable data={layaways} />
    </div>
  );
}
