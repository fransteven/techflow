"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/formatters";
import { getLayawayDetailsAction } from "@/app/actions/layaway-actions";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface LayawayDetailsDialogProps {
  layawayId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerName: string | null;
}

interface LayawayItem {
  id: string;
  productName: string;
  quantity: number;
  serialNumber?: string;
  agreedPrice: string | number;
}

interface LayawayPayment {
  id: string;
  createdAt: string | Date;
  method: string;
  notes?: string;
  amount: string | number;
}

interface LayawayDetails {
  items: LayawayItem[];
  payments: LayawayPayment[];
}

export function LayawayDetailsDialog({
  layawayId,
  open,
  onOpenChange,
  customerName,
}: LayawayDetailsDialogProps) {
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState<LayawayDetails>({ items: [], payments: [] });

  useEffect(() => {
    let active = true;
    if (open && layawayId) {
      const load = async () => {
        setLoading(true);
        try {
          const res = await getLayawayDetailsAction(layawayId);
          if (active && res.success && res.data) {
            setDetails(res.data as unknown as LayawayDetails);
          }
        } finally {
          if (active) setLoading(false);
        }
      };
      load();
    }
    return () => { active = false; };
  }, [open, layawayId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Detalles del Apartado</DialogTitle>
          <DialogDescription>
            Cliente: {customerName || "Desconocido"}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-6 text-center text-muted-foreground">Cargando...</div>
        ) : (
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-sm mb-3">Artículos Apartados</h4>
              <div className="space-y-3">
                {details.items.map((item: LayawayItem) => (
                  <div key={item.id} className="flex justify-between items-start text-sm border-b pb-2 last:border-0">
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      <div className="text-xs text-muted-foreground flex gap-2 mt-1">
                        <span>Cant: {item.quantity}</span>
                        {item.serialNumber && <span>SN: {item.serialNumber}</span>}
                      </div>
                    </div>
                    <div className="font-medium">{formatCurrency(Number(item.agreedPrice) * item.quantity)}</div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold text-sm mb-3">Historial de Pagos</h4>
              {details.payments.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin abonos registrados.</p>
              ) : (
                <div className="space-y-2">
                  {details.payments.map((payment: LayawayPayment) => (
                    <div key={payment.id} className="flex justify-between items-center text-sm bg-muted/30 p-2 rounded">
                      <div className="flex flex-col">
                        <span>{new Date(payment.createdAt).toLocaleDateString("es-ES")}</span>
                        <span className="text-xs text-muted-foreground capitalize">{payment.method} - {payment.notes}</span>
                      </div>
                      <Badge variant="secondary" className="font-mono">
                        +{formatCurrency(Number(payment.amount))}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
