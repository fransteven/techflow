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
  sku: string | null;
  isSerialized: boolean;
  stockTotal: number;
  avgCost: number;
  status: string;
}

interface StockTableProps {
  stock: StockItem[];
}

export function StockTable({ stock = [] }: StockTableProps) {
  const [selectedProduct, setSelectedProduct] = useState<StockItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const handleViewDetail = (item: StockItem) => {
    setSelectedProduct(item);
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
                <TableRow
                  key={item.productId}
                  className={item.stockTotal > 0 ? "bg-green-50/50 dark:bg-green-950/20" : ""}
                >
                  <TableCell className="font-medium flex items-center gap-2">
                    {item.productName || "N/A"}
                    {item.stockTotal > 0 && (
                      <Badge variant="outline" className="text-green-600 border-green-200 dark:border-green-800 dark:text-green-400 bg-green-50 dark:bg-green-900/30 text-[10px] h-5 hidden sm:inline-flex">
                        Disp
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center font-mono">
                    <span className={item.stockTotal > 0 ? "text-green-600 dark:text-green-400 font-bold" : "text-muted-foreground"}>
                      {item.stockTotal}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono text-muted-foreground">
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
                      onClick={() => handleViewDetail(item)}
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
