"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Package, Pencil, Trash2, SlidersHorizontal, DollarSign, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    className?: string;
  }
}

import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/formatters";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ProductWithStock } from "@/services/product-service";
import { toast } from "sonner";
import { EditProductDialog } from "./edit-product-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteProductAction } from "@/app/actions/product-actions";
import { EmptyState } from "@/components/ui/empty-state";

interface ProductTableProps {
  data: ProductWithStock[];
}

const CATEGORY_COLORS = [
  "bg-violet-100 text-violet-700",
  "bg-sky-100 text-sky-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-indigo-100 text-indigo-700",
];

function getCategoryColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return CATEGORY_COLORS[Math.abs(hash) % CATEGORY_COLORS.length];
}

export function ProductTable({ data }: ProductTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const [editProduct, setEditProduct] = React.useState<ProductWithStock | null>(null);
  const [deleteProduct, setDeleteProduct] = React.useState<ProductWithStock | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Stats computed from data
  const stats = React.useMemo(() => {
    const totalProducts = data.length;
    const activeCategories = new Set(data.map((p) => p.categoryId).filter(Boolean)).size;
    const inventoryValue = data.reduce(
      (sum, p) => sum + parseFloat(String(p.price)) * (p.stock || 0),
      0,
    );
    return { totalProducts, activeCategories, inventoryValue };
  }, [data]);

  const columns: ColumnDef<ProductWithStock>[] = [
    {
      accessorKey: "name",
      header: "Nombre",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="flex items-center gap-2 md:gap-3">
            <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
              <Package className="h-4 w-4 md:h-5 md:w-5 text-slate-400" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-900 truncate">{item.name}</div>
              {item.sku && (
                <div className="text-xs text-slate-500 truncate">SKU: {item.sku}</div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "categoryName",
      header: "Categoría",
      meta: { className: "hidden md:table-cell" },
      cell: ({ row }) => {
        const name = (row.getValue("categoryName") as string) || "Sin categoría";
        const colorClass = getCategoryColor(name);
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}
          >
            {name}
          </span>
        );
      },
    },
    {
      accessorKey: "price",
      header: "Precio",
      meta: { className: "w-28" },
      cell: ({ row }) => {
        const price = parseFloat(row.getValue("price"));
        return (
          <span className="text-sm font-medium text-slate-700 whitespace-nowrap">
            {formatCurrency(price)}
          </span>
        );
      },
    },
    {
      accessorKey: "isSerialized",
      header: "Tipo",
      meta: { className: "hidden md:table-cell" },
      cell: ({ row }) => {
        const isSerialized = row.getValue("isSerialized");
        return (
          <Badge
            variant={isSerialized ? "secondary" : "default"}
            className={
              isSerialized
                ? "bg-indigo-100 text-indigo-700 hover:bg-indigo-100 border-0"
                : "bg-slate-100 text-slate-600 hover:bg-slate-100 border-0"
            }
          >
            {isSerialized ? "Serializado" : "Estándar"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      meta: { className: "w-16" },
      header: () => <span className="sr-only">Acciones</span>,
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className="flex items-center justify-end gap-1">
            <button
              title="Editar"
              aria-label={`Editar ${product.name}`}
              className="text-slate-400 hover:text-indigo-600 transition-colors p-1 rounded"
              onClick={() => setEditProduct(product)}
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              title="Eliminar"
              aria-label={`Eliminar ${product.name}`}
              className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded"
              onClick={() => setDeleteProduct(product)}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        );
      },
    },
  ];

  const handleDelete = React.useCallback(async () => {
    if (!deleteProduct) return;
    setIsDeleting(true);

    try {
      const result = await deleteProductAction(deleteProduct.id);
      if (result.success) {
        toast.success(result.message || "Producto eliminado exitosamente");
      } else {
        toast.error(result.error || "No se pudo eliminar el producto");
      }
    } catch (error) {
      toast.error("Ocurrió un error inesperado al intentar eliminar el producto");
    } finally {
      setIsDeleting(false);
      setDeleteProduct(null);
    }
  }, [deleteProduct]);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    initialState: { pagination: { pageSize: 10 } },
  });

  const { pageIndex, pageSize } = table.getState().pagination;
  const filteredRows = table.getFilteredRowModel().rows;
  const totalFiltered = filteredRows.length;
  const from = totalFiltered === 0 ? 0 : pageIndex * pageSize + 1;
  const to = Math.min((pageIndex + 1) * pageSize, totalFiltered);

  return (
    <>
      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Card Header */}
        <div className="px-4 md:px-6 py-4 md:py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-800">Listado de Productos</h2>
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[140px]">
              <input
                type="text"
                placeholder="Buscar producto..."
                value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                onChange={(e) =>
                  table.getColumn("name")?.setFilterValue(e.target.value)
                }
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

        {/* Table */}
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
                      headline="No hay productos en el catálogo"
                      description="Registra un nuevo producto para comenzar"
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

      {/* Stats Footer */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-500">Total Productos</span>
            <div className="bg-indigo-100 p-2 rounded-full">
              <Package className="h-5 w-5 text-indigo-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.totalProducts}</div>
          <p className="mt-1 text-xs text-slate-400 font-medium">Productos en el catálogo</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-500">Categorías Activas</span>
            <div className="bg-violet-100 p-2 rounded-full">
              <Tag className="h-5 w-5 text-violet-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">{stats.activeCategories}</div>
          <p className="mt-1 text-xs text-slate-400 font-medium">Categorías con productos</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-500">Valor de Inventario</span>
            <div className="bg-green-100 p-2 rounded-full">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {formatCurrency(stats.inventoryValue)}
          </div>
          <p className="mt-1 text-xs text-slate-400 font-medium">Precio de venta × stock actual</p>
        </div>
      </div>

      {editProduct && (
        <EditProductDialog
          product={editProduct as any}
          open={!!editProduct}
          onOpenChange={(open: boolean) => !open && setEditProduct(null)}
        />
      )}

      <AlertDialog
        open={!!deleteProduct}
        onOpenChange={(open: boolean) => !open && setDeleteProduct(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás completamente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el producto{" "}
              <strong>{deleteProduct?.name}</strong> de forma permanente del catálogo.
              <br />
              <br />
              <strong>Atención:</strong> Si este producto tiene registro de entradas, salidas
              o stock (seriales) en el inventario, la eliminación será rechazada para mantener
              la integridad financiera del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isDeleting}
            >
              {isDeleting ? "Eliminando..." : "Sí, Eliminar Producto"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
