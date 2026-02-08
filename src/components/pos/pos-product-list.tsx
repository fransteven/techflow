"use client";

import { useState, useRef, useEffect } from "react";
import { Search, ScanBarcode, Plus, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { searchProductAction } from "@/app/actions/pos-action";
import type { ProductSearchResult } from "@/lib/validators/pos-validator";

interface PosProductListProps {
  onAddToCart: (item: {
    productId: string;
    productItemId: string | null;
    name: string;
    price: number;
    isSerialized: boolean;
    quantity: number;
    unitCost: number;
  }) => void;
}

export function PosProductList({ onAddToCart }: PosProductListProps) {
  const [barcode, setBarcode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ProductSearchResult | null>(null);
  const [salePrice, setSalePrice] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!barcode.trim()) return;

    setLoading(true);
    try {
      const response = await searchProductAction(barcode);
      if (response.success && response.data) {
        setResult(response.data);
        setSalePrice(Number(response.data.suggestedPrice));
      } else {
        toast.error(response.error || "Producto no encontrado");
        setResult(null);
      }
    } catch (error) {
      toast.error("Error al buscar el producto");
    } finally {
      setLoading(false);
      setBarcode("");
      inputRef.current?.focus();
    }
  };

  const isPriceInvalid = result ? salePrice < result.avgUnitCost : false;

  const handleAdd = () => {
    if (!result) return;
    if (isPriceInvalid) {
      toast.error("El precio de venta no puede ser menor al costo unitario");
      return;
    }

    if (result.isSerialized && !result.productItemId) {
      toast.error(
        "Debe escanear un serial específico para vender este producto.",
      );
      return;
    }

    onAddToCart({
      productId: result.productId,
      productItemId: result.productItemId,
      name: result.name,
      price: salePrice,
      isSerialized: result.isSerialized,
      quantity: 1,
      unitCost: result.avgUnitCost,
    });

    setResult(null);
    setBarcode("");
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col h-full gap-6">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            ref={inputRef}
            placeholder="Escanear código de barras o digitar SKU..."
            className="pl-10 h-12 text-lg"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            disabled={loading}
            autoFocus
          />
        </div>
        <Button type="submit" size="lg" disabled={loading || !barcode.trim()}>
          {loading ? "Buscando..." : <ScanBarcode className="h-5 w-5 mr-2" />}
          {loading ? "" : "Buscar"}
        </Button>
      </form>

      {result && (
        <div className="border rounded-lg bg-card overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead className="text-center">Stock Disp.</TableHead>
                <TableHead className="text-right">P. Sugerido</TableHead>
                <TableHead className="text-right">Costo Unit.</TableHead>
                <TableHead className="w-[180px]">Precio de Venta</TableHead>
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">
                  <div>
                    {result.name}
                    <div className="text-xs text-muted-foreground flex gap-2 mt-1">
                      <Badge variant="outline" className="text-[10px]">
                        {result.isSerialized ? "Serializado" : "No Serializado"}
                      </Badge>
                      {result.sku && (
                        <span className="opacity-70">SKU: {result.sku}</span>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge
                    variant={
                      result.availableQty > 0 ? "secondary" : "destructive"
                    }
                  >
                    {result.availableQty}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-medium">
                  ${Number(result.suggestedPrice).toFixed(2)}
                </TableCell>
                <TableCell className="text-right opacity-70">
                  ${result.avgUnitCost.toFixed(2)}
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <Input
                      type="number"
                      step="0.01"
                      value={salePrice}
                      onChange={(e) => setSalePrice(Number(e.target.value))}
                      className={
                        isPriceInvalid
                          ? "border-destructive focus-visible:ring-destructive"
                          : ""
                      }
                    />
                    {isPriceInvalid && (
                      <div className="text-[10px] text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        No puede ser menor al costo
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    onClick={handleAdd}
                    disabled={isPriceInvalid || result.availableQty <= 0}
                    size="sm"
                    className="gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    Añadir
                  </Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )}

      {!result && !loading && (
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-xl p-12">
          <ScanBarcode className="h-16 w-16 mb-4 opacity-10" />
          <p className="text-lg font-medium">
            Escanea un producto para comenzar
          </p>
          <p className="text-sm opacity-60">
            Los resultados aparecerán aquí para su validación
          </p>
        </div>
      )}
    </div>
  );
}
