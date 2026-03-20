"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { SellerCommission } from "@/services/profits-service";

const fmt = (amount: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount);

interface SellerCommissionsTableProps {
  data: SellerCommission[];
}

export function SellerCommissionsTable({ data }: SellerCommissionsTableProps) {
  const totals = data.reduce(
    (acc, row) => ({
      saleCount: acc.saleCount + row.saleCount,
      totalConsignmentRevenue: acc.totalConsignmentRevenue + row.totalConsignmentRevenue,
      totalCommission: acc.totalCommission + row.totalCommission,
    }),
    { saleCount: 0, totalConsignmentRevenue: 0, totalCommission: 0 },
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-base font-semibold">
          Comisiones de Vendedores
        </CardTitle>
        <Badge variant="secondary">{data.length} vendedor{data.length !== 1 ? "es" : ""}</Badge>
      </CardHeader>
      <CardContent className="p-0">
        {data.length === 0 ? (
          <div className="px-6 pb-6 text-sm text-muted-foreground text-center py-8">
            No hay comisiones generadas en este período.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendedor</TableHead>
                  <TableHead className="text-right">Ventas Consig.</TableHead>
                  <TableHead className="text-right">Ingresos Generados</TableHead>
                  <TableHead className="text-right font-semibold">Comisión (10%)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row) => (
                  <TableRow key={row.userId || row.sellerName}>
                    <TableCell className="font-medium">{row.sellerName}</TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {row.saleCount}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {fmt(row.totalConsignmentRevenue)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm font-semibold text-blue-700">
                      {fmt(row.totalCommission)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell className="font-semibold">Total</TableCell>
                  <TableCell className="text-right font-mono font-semibold">
                    {totals.saleCount}
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold">
                    {fmt(totals.totalConsignmentRevenue)}
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold text-blue-700">
                    {fmt(totals.totalCommission)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
