"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Printer } from "lucide-react";
import { ProductLabel } from "./product-label";

export type PrintData =
  | {
      type: "serialized";
      items: { id: string; serialNumber: string | null }[];
    }
  | {
      type: "generic";
      product: { sku: string | null; name: string };
      quantity: number;
    };

interface PrintLabelsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: PrintData | null;
}

export function PrintLabelsDialog({
  open,
  onOpenChange,
  data,
}: PrintLabelsDialogProps) {
  const [copies, setCopies] = useState<number>(
    data?.type === "generic" ? data.quantity : 1,
  );

  // Update copies when data changes (for generic items)
  if (data?.type === "generic" && copies === 0) {
    setCopies(data.quantity);
  }

  const handlePrint = () => {
    window.print();
  };

  if (!data) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Imprimir Etiquetas</DialogTitle>
          <DialogDescription>
            Vista previa de las etiquetas. Asegúrese de que la impresora térmica
            esté configurada (50mm x 30mm).
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {data.type === "generic" && (
            <div className="flex items-center gap-4 mb-4">
              <Label htmlFor="copies" className="whitespace-nowrap">
                Cantidad de copias:
              </Label>
              <Input
                id="copies"
                type="number"
                min="1"
                value={copies}
                onChange={(e) => setCopies(parseInt(e.target.value) || 1)}
                className="w-24"
              />
            </div>
          )}

          <div className="border rounded-md p-4 bg-gray-100 overflow-auto max-h-[300px] print-container">
            <style jsx global>{`
              @media print {
                @page {
                  size: 50mm 30mm;
                  margin: 0;
                }
                body * {
                  visibility: hidden;
                }
                .print-container,
                .print-container * {
                  visibility: visible;
                }
                .print-container {
                  position: fixed;
                  left: 0;
                  top: 0;
                  width: 100%;
                  height: 100%;
                  margin: 0;
                  padding: 0 !important;
                  background: white !important;
                  border: none !important;
                  overflow: visible !important;
                }
                .print-item {
                  page-break-after: always;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  width: 50mm;
                  height: 30mm;
                }
              }
            `}</style>

            <div className="flex flex-col gap-4 items-center print-content">
              {data.type === "serialized"
                ? // Serialized: Render one label per item
                  data.items.map((item) => (
                    <div key={item.id} className="print-item">
                      <ProductLabel
                        type="qr"
                        value={item.id}
                        label="TechFlow"
                        humanReadable={
                          item.serialNumber || item.id.substring(0, 8)
                        }
                      />
                    </div>
                  ))
                : // Generic: Render N copies of the same label
                  Array.from({ length: copies }).map((_, i) => (
                    <div key={i} className="print-item">
                      <ProductLabel
                        type="barcode"
                        value={data.product.sku || "NO-SKU"}
                        label={data.product.name}
                        humanReadable={data.product.sku || "NO-SKU"}
                      />
                    </div>
                  ))}
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
