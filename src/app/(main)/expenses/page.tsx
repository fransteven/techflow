import { getExpensesAction } from "@/app/actions/expense-actions";
import { CreateExpenseModal } from "@/components/expenses/create-expense-modal";
import { ExpenseCategoryModal } from "@/components/expenses/expense-category-modal";
import { ExpensesTable } from "@/components/expenses/expenses-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Banknote } from "lucide-react";

export default async function ExpensesPage() {
  const { success, data, error } = await getExpensesAction();

  if (!success || !data) {
    return (
      <div className="p-8">
        <div className="rounded-md bg-destructive/15 p-4 text-destructive">
          Error al cargar gastos: {error}
        </div>
      </div>
    );
  }

  const { expenses, categories } = data;

  const totalExpenses = expenses.reduce(
    (acc, curr) => acc + parseFloat(curr.amount),
    0,
  );

  return (
    <div className="container mx-auto space-y-8 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gastos</h2>
          <p className="text-muted-foreground">
            Gestiona y visualiza los gastos operativos del negocio.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExpenseCategoryModal />
          <CreateExpenseModal categories={categories} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Gastos Totales
            </CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat("es-CO", {
                style: "currency",
                currency: "COP",
              }).format(totalExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total histórico registrado
            </p>
          </CardContent>
        </Card>
      </div>

      <ExpensesTable data={expenses} />
    </div>
  );
}
