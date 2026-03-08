"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/formatters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, HandCoins, XCircle } from "lucide-react";
import { useState } from "react";
import { LayawayDetailsDialog } from "./layaway-details-dialog";
import { LayawayPaymentDialog } from "./layaway-payment-dialog";
import { cancelLayawayAction } from "@/app/actions/layaway-actions";
import { toast } from "sonner";
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

interface Layaway {
  id: string;
  status: string;
  totalAmount: number;
  expiresAt: Date;
  createdAt: Date;
  customerName: string | null;
  customerDocument: string | null;
  customerPhone: string | null;
  totalPaid: number;
  balance: number;
}

interface LayawaysTableProps {
  data: Layaway[];
}

export function LayawaysTable({ data }: LayawaysTableProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [selectedLayaway, setSelectedLayaway] = useState<Layaway | null>(null);

  const getStatusBadge = (status: string, expiresAt: Date, balance: number) => {
    if (status === "completed" || balance <= 0) {
      return <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">Completado</Badge>;
    }
    if (status === "cancelled") {
      return <Badge variant="destructive">Cancelado</Badge>;
    }
    
    const isExpired = new Date(expiresAt) < new Date();
    if (isExpired) {
      return <Badge variant="destructive">Vencido</Badge>;
    }

    return <Badge variant="outline" className="border-amber-500 text-amber-600 bg-amber-50">Activo</Badge>;
  };

  const handleCancel = async () => {
    if (!selectedLayaway) return;
    const res = await cancelLayawayAction(selectedLayaway.id);
    if (res.success) {
      toast.success("Apartado cancelado. El inventario ha sido liberado.");
      setCancelOpen(false);
    } else {
      toast.error(res.error || "Error al cancelar el apartado");
    }
  };

  if (data.length === 0) {
    return (
      <div className="flex justify-center items-center h-40 border rounded-md bg-card text-muted-foreground">
        No hay apartados registrados.
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Vencimiento</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Abonado</TableHead>
              <TableHead className="text-right">Saldo</TableHead>
              <TableHead className="text-center">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((layaway) => (
              <TableRow key={layaway.id}>
                <TableCell className="text-xs">
                  {new Date(layaway.createdAt).toLocaleDateString("es-ES")}
                </TableCell>
                <TableCell>
                  <div className="font-medium">{layaway.customerName || "Sin Nombre"}</div>
                  <div className="text-xs text-muted-foreground">
                    {layaway.customerDocument} {layaway.customerPhone ? `• ${layaway.customerPhone}` : ""}
                  </div>
                </TableCell>
                <TableCell>
                  {getStatusBadge(layaway.status, layaway.expiresAt, layaway.balance)}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {new Date(layaway.expiresAt).toLocaleDateString("es-ES")}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(layaway.totalAmount)}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {formatCurrency(layaway.totalPaid)}
                </TableCell>
                <TableCell className="text-right font-bold text-primary">
                  {formatCurrency(layaway.balance)}
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 px-2" 
                      title="Ver Detalles"
                      onClick={() => {
                        setSelectedLayaway(layaway);
                        setDetailsOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-1" /> Detalles
                    </Button>
                    {layaway.status === "active" && layaway.balance > 0 && (
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="h-8 px-2" 
                        title="Abonar"
                        onClick={() => {
                          setSelectedLayaway(layaway);
                          setPaymentOpen(true);
                        }}
                      >
                        <HandCoins className="h-4 w-4 mr-1" /> Abonar
                      </Button>
                    )}
                    {layaway.status === "active" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        title="Cancelar Apartado"
                        onClick={() => {
                          setSelectedLayaway(layaway);
                          setCancelOpen(true);
                        }}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <LayawayDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        layawayId={selectedLayaway?.id || null}
        customerName={selectedLayaway?.customerName || null}
      />

      <LayawayPaymentDialog
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        layawayId={selectedLayaway?.id || null}
        balance={selectedLayaway?.balance || 0}
        onSuccess={() => setPaymentOpen(false)}
      />

      <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro de cancelar este apartado?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción es irreversible. Los productos reservados volverán a estar disponibles en el inventario para ser vendidos a otros clientes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Volver</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Confirmar Cancelación
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
