"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

import { InventoryItem } from "@/lib/validators/inventory-validator";

interface InventoryListProps {
  items: InventoryItem[];
  filterStatus?: "in_stock" | "sold" | "warranty" | "all";
}

export function InventoryList({
  items = [],
  filterStatus = "all",
}: InventoryListProps) {
  const filteredItems =
    filterStatus === "all"
      ? items
      : items.filter((item) => {
          if (filterStatus === "in_stock") return item.status === "available";
          if (filterStatus === "sold") return item.status === "sold";
          if (filterStatus === "warranty") return item.status === "defective";
          return true;
        });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Serial / IMEI</TableHead>
            <TableHead>Producto</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Fecha Ingreso</TableHead>
            {filterStatus !== "in_stock" && (
              <TableHead>Fecha Venta / Salida</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-mono">
                  {item.serial || "N/A"}
                </TableCell>
                <TableCell className="font-medium">
                  {item.productName || "Unknown"}
                </TableCell>
                <TableCell>{item.sku || "-"}</TableCell>
                <TableCell>
                  {item.status === "available" && (
                    <Badge variant="default">En Stock</Badge>
                  )}
                  {item.status === "sold" && (
                    <Badge variant="secondary">Vendido</Badge>
                  )}
                  {item.status === "defective" && (
                    <Badge variant="destructive">Garantía</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {item.createdAt ? item.createdAt.toLocaleDateString() : "-"}
                </TableCell>
                {filterStatus !== "in_stock" && (
                  <TableCell>
                    {item.soldDate ? item.soldDate.toLocaleDateString() : "-"}
                  </TableCell>
                )}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No hay items en esta categoría.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
