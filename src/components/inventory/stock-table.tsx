"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { ProductDetailSheet } from "./product-detail-sheet";
import { formatCurrency } from "@/lib/formatters";

interface StockItem {
  productId: string;
  productName: string | null;
  stockTotal: number;
  avgCost: number;
  status: string;
}

interface StockTableProps {
  stock: StockItem[];
}

export function StockTable({ stock = [] }: StockTableProps) {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null,
  );
  const [detailOpen, setDetailOpen] = useState(false);

  const handleViewDetail = (productId: string) => {
    setSelectedProductId(productId);
    setDetailOpen(true);
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Producto</TableHead>
              <TableHead className="text-center">Stock Total</TableHead>
              <TableHead className="text-right">Costo Promedio</TableHead>
              <TableHead className="text-center">Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stock.length > 0 ? (
              stock.map((item) => (
                <TableRow key={item.productId}>
                  <TableCell className="font-medium">
                    {item.productName || "N/A"}
                  </TableCell>
                  <TableCell className="text-center font-mono">
                    {item.stockTotal}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(item.avgCost)}
                  </TableCell>
                  <TableCell className="text-center">
                    {item.status === "low" ? (
                      <Badge variant="destructive">Bajo</Badge>
                    ) : (
                      <Badge variant="default">OK</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetail(item.productId)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver Detalle
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No hay productos en el inventario.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {selectedProductId && (
        <ProductDetailSheet
          productId={selectedProductId}
          open={detailOpen}
          onOpenChange={setDetailOpen}
        />
      )}
    </>
  );
}
