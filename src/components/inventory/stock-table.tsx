"use client";

import { useState, useMemo } from "react";
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
import { Eye, Package, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    className?: string;
  }
}
import { ProductDetailSheet } from "./product-detail-sheet";
import { formatCurrency } from "@/lib/formatters";
import { EmptyState } from "@/components/ui/empty-state";

interface StockItem {
  productId: string;
  productName: string | null;
  sku: string | null;
  isSerialized: boolean;
  stockTotal: number;
  avgCost: number;
  status: string;
}

interface StockTableProps {
  stock: StockItem[];
  /** Slot para el componente de búsqueda (se renderiza en el header de la card) */
  searchSlot?: React.ReactNode;
}

function StockStatusBadge({ status, stock }: { status: string; stock: number }) {
  if (stock <= 0) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
        Sin stock
      </span>
    );
  }
  if (status === "low") {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
        Bajo Stock
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
      Stock OK
    </span>
  );
}

export function StockTable({ stock = [], searchSlot }: StockTableProps) {
  const [selectedProduct, setSelectedProduct] = useState<StockItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = useMemo<ColumnDef<StockItem>[]>(
    () => [
      {
        accessorKey: "productName",
        header: "Producto",
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex items-center gap-2 md:gap-3">
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                <Package className="h-4 w-4 md:h-5 md:w-5 text-slate-400" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-slate-900 truncate">
                  {item.productName || "N/A"}
                </div>
                {item.sku && (
                  <div className="text-xs text-slate-500 truncate">SKU: {item.sku}</div>
                )}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "stockTotal",
        header: "Stock Total",
        meta: { className: "w-28" },
        cell: ({ row }) => {
          const val = row.getValue("stockTotal") as number;
          return (
            <span className="text-sm font-medium text-slate-700">
              {val}
            </span>
          );
        },
      },
      {
        accessorKey: "avgCost",
        header: "Costo Promedio",
        meta: { className: "hidden md:table-cell" },
        cell: ({ row }) => (
          <span className="text-sm text-slate-600">
            {formatCurrency(row.getValue("avgCost"))}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Estado",
        meta: { className: "hidden md:table-cell" },
        cell: ({ row }) => (
          <StockStatusBadge
            status={row.getValue("status")}
            stock={row.original.stockTotal}
          />
        ),
      },
      {
        id: "actions",
        meta: { className: "w-12" },
        header: () => <span className="sr-only">Acciones</span>,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <button
              title="Ver detalle"
              aria-label={`Ver detalle de ${row.original.productName}`}
              className="text-slate-400 hover:text-indigo-600 transition-colors p-1 rounded"
              onClick={() => {
                setSelectedProduct(row.original);
                setDetailOpen(true);
              }}
            >
              <Eye className="h-5 w-5" />
            </button>
          </div>
        ),
      },
    ],
    [],
  );

  const table = useReactTable({
    data: stock,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    initialState: { pagination: { pageSize: 10 } },
  });

  const { pageIndex, pageSize } = table.getState().pagination;
  const filteredRows = table.getFilteredRowModel().rows;
  const totalFiltered = filteredRows.length;
  const from = totalFiltered === 0 ? 0 : pageIndex * pageSize + 1;
  const to = Math.min((pageIndex + 1) * pageSize, totalFiltered);

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Card Header: título + búsqueda */}
        <div className="px-4 md:px-6 py-4 md:py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-800">
            Listado de Inventario
          </h2>
          <div className="flex items-center gap-2">
            {searchSlot ?? (
              <div className="relative flex-1 min-w-[140px]">
                <input
                  type="text"
                  placeholder="Buscar producto..."
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full outline-none"
                />
                <svg
                  className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                  />
                </svg>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              className="text-slate-600 border-slate-200 bg-slate-50 hover:bg-slate-100 gap-2 shrink-0"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">Filtrar</span>
            </Button>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <Table className="table-fixed w-full">
            <TableHeader>
              <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                {table.getHeaderGroups().map((headerGroup) =>
                  headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className={cn(
                        "px-3 md:px-6 py-3 md:py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider",
                        header.column.columnDef.meta?.className
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  )),
                )}
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100">
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cn("px-3 md:px-6 py-3 md:py-4", cell.column.columnDef.meta?.className)}
                      >
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
                  <TableCell colSpan={columns.length} className="p-0">
                    <EmptyState
                      icon={Package}
                      headline="No hay productos en el inventario"
                      description="Agrega stock para ver los productos aquí"
                      className="border-0"
                    />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Footer */}
        <div className="px-4 md:px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="text-sm text-slate-500 text-center sm:text-left">
            {totalFiltered === 0 ? (
              "Sin resultados"
            ) : (
              <>
                Mostrando{" "}
                <span className="font-medium text-slate-700">{from}–{to}</span>{" "}
                de{" "}
                <span className="font-medium text-slate-700">{totalFiltered}</span>{" "}
                productos
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="border-slate-300 text-slate-600 hover:bg-slate-50"
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="border-slate-300 text-slate-600 hover:bg-slate-50"
            >
              Siguiente
            </Button>
          </div>
        </div>
      </div>

      {selectedProduct && (
        <ProductDetailSheet
          product={selectedProduct}
          open={detailOpen}
          onOpenChange={setDetailOpen}
        />
      )}
    </>
  );
}
