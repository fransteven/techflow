"use client";

import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getProductSerialsAction } from "@/app/actions/inventory-actions";

interface ProductDetailSheetProps {
  productId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Serial {
  id: string;
  serialNumber: string | null;
  sku: string | null;
  status: string;
  createdAt: Date;
}

export function ProductDetailSheet({
  productId,
  open,
  onOpenChange,
}: ProductDetailSheetProps) {
  const [serials, setSerials] = useState<Serial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && productId) {
      setLoading(true);
      getProductSerialsAction(productId)
        .then((result) => {
          if (result.success && result.data) {
            setSerials(result.data);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [open, productId]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return <Badge variant="default">Disponible</Badge>;
      case "sold":
        return <Badge variant="secondary">Vendido</Badge>;
      case "defective":
        return <Badge variant="destructive">Defectuoso</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col overflow-y-auto sm:max-w-2xl p-6">
        <SheetHeader className="space-y-2 pb-6">
          <SheetTitle>Detalle de Producto</SheetTitle>
          <SheetDescription>
            Lista de seriales/IMEIs registrados para este producto
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-muted-foreground">Cargando...</p>
            </div>
          ) : serials.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Serial / IMEI</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha Registro</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {serials.map((serial) => (
                    <TableRow key={serial.id}>
                      <TableCell className="font-mono font-medium">
                        {serial.serialNumber || "N/A"}
                      </TableCell>
                      <TableCell className="font-mono">
                        {serial.sku || "—"}
                      </TableCell>
                      <TableCell>{getStatusBadge(serial.status)}</TableCell>
                      <TableCell className="text-sm">
                        {new Date(serial.createdAt).toLocaleDateString(
                          "es-ES",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          },
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 border rounded-md">
              <p className="text-muted-foreground px-4 text-center">
                Este producto no tiene seriales registrados.
              </p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
