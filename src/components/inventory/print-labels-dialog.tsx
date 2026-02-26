"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download } from "lucide-react";

export type PrintData =
  | {
      type: "serialized";
      productName: string;
      items: { id: string; serialNumber: string | null }[];
      price: number | string;
    }
  | {
      type: "generic";
      product: { sku: string | null; name: string };
      quantity: number;
      price: number | string;
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
  const isFactoryBarcode =
    data?.type === "generic" && data.product.sku
      ? /^\d{8,14}$/.test(data.product.sku)
      : false;

  const formatPrice = (value: number | string) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0,
    }).format(Number(value));
  };

  const handleDownloadExcel = () => {
    if (!data) return;

    const rows: Array<{
      Nombre_Producto: string;
      Precio_Venta: string;
      Codigo_Identificador: string;
    }> = [];

    if (data.type === "serialized") {
      data.items.forEach((item) => {
        rows.push({
          Nombre_Producto: data.productName,
          Precio_Venta: formatPrice(data.price),
          Codigo_Identificador: item.id,
        });
      });
    } else if (data.type === "generic" && data.product.sku) {
      if (isFactoryBarcode) {
        return;
      }

      for (let i = 0; i < data.quantity; i++) {
        rows.push({
          Nombre_Producto: data.product.name,
          Precio_Venta: formatPrice(data.price),
          Codigo_Identificador: data.product.sku,
        });
      }
    }

    if (rows.length === 0) return;

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Etiquetas NIIMBOT");

    XLSX.writeFile(workbook, `etiquetas_niimbot_${new Date().getTime()}.xlsx`);
    onOpenChange(false);
  };

  if (!data) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Exportar Etiquetas NIIMBOT</DialogTitle>
          <DialogDescription>
            Genera un archivo Excel (.xlsx) estructurado para importarlo en la
            app de NIIMBOT B1.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {isFactoryBarcode ? (
            <div className="rounded-md bg-yellow-50 p-4 border border-yellow-200">
              <p className="text-sm font-medium text-yellow-800">
                Optimización de recursos: El código escaneado es de fábrica
                (EAN/UPC).
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                Este producto ya utiliza un código de barras de fábrica
                reconocible por el sistema. No requiere impresión adicional.
              </p>
            </div>
          ) : (
            <div className="rounded-md bg-blue-50 p-4 border border-blue-200">
              <p className="text-sm text-blue-800 font-medium">
                Se generarán etiquetas para:
              </p>
              <ul className="list-disc list-inside text-sm text-blue-700 mt-2 space-y-1">
                {data.type === "serialized" ? (
                  <li>{data.items.length} equipo(s) serializado(s).</li>
                ) : (
                  <li>
                    {data.quantity} copia(s) del producto{" "}
                    <strong>{data.product.name}</strong>.
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
          <Button onClick={handleDownloadExcel} disabled={isFactoryBarcode}>
            <Download className="mr-2 h-4 w-4" />
            Descargar Excel (.xlsx)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
