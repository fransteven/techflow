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
import type { OwnerPayout } from "@/services/profits-service";

const fmt = (amount: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount);

interface OwnerPayoutsTableProps {
  data: OwnerPayout[];
}

export function OwnerPayoutsTable({ data }: OwnerPayoutsTableProps) {
  const totals = data.reduce(
    (acc, row) => ({
      saleCount: acc.saleCount + row.saleCount,
      totalRevenue: acc.totalRevenue + row.totalRevenue,
      totalCost: acc.totalCost + row.totalCost,
      grossProfit: acc.grossProfit + row.grossProfit,
      masterplayShare: acc.masterplayShare + row.masterplayShare,
      ownerPayout: acc.ownerPayout + row.ownerPayout,
    }),
    {
      saleCount: 0,
      totalRevenue: 0,
      totalCost: 0,
      grossProfit: 0,
      masterplayShare: 0,
      ownerPayout: 0,
    },
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-base font-semibold">
          Liquidación a Propietarios
        </CardTitle>
        <Badge variant="secondary">{data.length} propietario{data.length !== 1 ? "s" : ""}</Badge>
      </CardHeader>
      <CardContent className="p-0">
        {data.length === 0 ? (
          <div className="px-6 pb-6 text-sm text-muted-foreground text-center py-8">
            No hay ventas de consignación en este período.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Propietario</TableHead>
                  <TableHead className="text-right">Ventas</TableHead>
                  <TableHead className="text-right">Ingresos</TableHead>
                  <TableHead className="text-right">Costo</TableHead>
                  <TableHead className="text-right">Ut. Bruta</TableHead>
                  <TableHead className="text-right">Masterplay (40%)</TableHead>
                  <TableHead className="text-right font-semibold">Pago (50%)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row) => (
                  <TableRow key={row.ownerId}>
                    <TableCell className="font-medium">{row.ownerName}</TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {row.saleCount}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {fmt(row.totalRevenue)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm text-muted-foreground">
                      {fmt(row.totalCost)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {fmt(row.grossProfit)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm text-muted-foreground">
                      {fmt(row.masterplayShare)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm font-semibold text-green-700">
                      {fmt(row.ownerPayout)}
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
                    {fmt(totals.totalRevenue)}
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold">
                    {fmt(totals.totalCost)}
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold">
                    {fmt(totals.grossProfit)}
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold">
                    {fmt(totals.masterplayShare)}
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold text-green-700">
                    {fmt(totals.ownerPayout)}
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
