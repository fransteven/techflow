"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface ImportCostRow {
  id: string;
  purchaseDate: Date;
  productName: string | null;
  specs: Record<string, string> | null;
  condition: string;
  provider: string | null;
  status: string;
  baseUsdCost: string;
  totalCostPesos: string;
  catalogPrice: string | null;
  mastercardCommissionPesos: string | null;
  casilleroPesos: string;
  productPesos: string;
  customsTariffPesos: string;
  productTrm: string;
  casilleroTrm: string;
  notes: string | null;
}

interface ImportCostsTableProps {
  data: ImportCostRow[];
}

const formatCOP = (value: string | null | undefined) => {
  if (!value) return "—";
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(parseFloat(value));
};

const formatUSD = (value: string | null | undefined) => {
  if (!value) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(parseFloat(value));
};

export const columns: ColumnDef<ImportCostRow>[] = [
  {
    accessorKey: "purchaseDate",
    header: "Fecha",
    cell: ({ row }) =>
      format(new Date(row.getValue("purchaseDate")), "dd MMM yyyy", {
        locale: es,
      }),
  },
  {
    accessorKey: "productName",
    header: "Dispositivo",
    cell: ({ row }) => {
      const name = row.getValue("productName") as string | null;
      const specs = row.original.specs;
      const specValues = specs
        ? Object.values(specs).filter(Boolean)
        : [];
      return (
        <div className="space-y-1">
          <span>{name || "—"}</span>
          {specValues.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {specValues.map((val) => (
                <Badge
                  key={val}
                  variant="secondary"
                  className="bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] py-0 px-1.5 font-medium"
                >
                  {val}
                </Badge>
              ))}
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "condition",
    header: "Condición",
    cell: ({ row }) => (
      <Badge variant="outline">{row.getValue("condition")}</Badge>
    ),
  },
  {
    accessorKey: "provider",
    header: "Proveedor",
    cell: ({ row }) => row.getValue("provider") || "—",
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge variant={status === "comprado" ? "default" : "secondary"}>
          {status === "comprado" ? "Comprado" : "Cotización"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "baseUsdCost",
    header: "Costo USD",
    cell: ({ row }) => (
      <span className="font-mono text-sm">
        {formatUSD(row.getValue("baseUsdCost"))}
      </span>
    ),
  },
  {
    accessorKey: "totalCostPesos",
    header: "Costo Total (COP)",
    cell: ({ row }) => (
      <span className="font-semibold">
        {formatCOP(row.getValue("totalCostPesos"))}
      </span>
    ),
  },
  {
    id: "estimatedMargin",
    header: "Margen Estimado",
    cell: ({ row }) => {
      const catalogPrice = parseFloat(row.original.catalogPrice ?? "0");
      const totalCost = parseFloat(row.original.totalCostPesos ?? "0");
      if (!catalogPrice || !totalCost) return "—";
      const margin = catalogPrice - totalCost;
      const marginPct = ((margin / catalogPrice) * 100).toFixed(1);
      return (
        <div className="text-sm">
          <div className={margin >= 0 ? "text-green-600" : "text-red-600"}>
            {formatCOP(margin.toString())}
          </div>
          <div className="text-muted-foreground text-[11px]">{marginPct}%</div>
        </div>
      );
    },
  },
];

export function ImportCostsTable({ data }: ImportCostsTableProps) {
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filtrar por dispositivo, proveedor..."
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="w-full">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No hay registros de importación.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
}
