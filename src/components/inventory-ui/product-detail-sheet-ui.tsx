"use client";

import { X, Copy, Smartphone, Check } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";

// Dummy data estático
const productData = {
  id: "1",
  name: "iPhone 15 Pro Max",
  sku: "IPH15PM-256-BLK",
  attributes: { storage: "256GB", color: "Negro Titanio" },
  totalStock: 12,
};

const serialsData = [
  {
    id: "s1",
    serial: "DNQXK4XY12",
    imei: "352789102345678",
    status: "available" as const,
    condition: { battery: 100 },
    cost: 4250000,
    owner: "Propio",
    registeredAt: "2024-01-15",
  },
  {
    id: "s2",
    serial: "DNQXK4XY13",
    imei: "352789102345679",
    status: "reserved" as const,
    condition: { battery: 98 },
    cost: 4250000,
    owner: "Propio",
    registeredAt: "2024-01-15",
  },
  {
    id: "s3",
    serial: "DNQXK4XY14",
    imei: "352789102345680",
    status: "available" as const,
    condition: { battery: 100 },
    cost: 4100000,
    owner: "Consignación - Juan Pérez",
    registeredAt: "2024-01-18",
  },
  {
    id: "s4",
    serial: "DNQXK4XY15",
    imei: "352789102345681",
    status: "sold" as const,
    condition: { battery: 95 },
    cost: 4250000,
    owner: "Propio",
    registeredAt: "2024-01-10",
  },
  {
    id: "s5",
    serial: "DNQXK4XY16",
    imei: "352789102345682",
    status: "defective" as const,
    condition: { battery: 78 },
    cost: 3800000,
    owner: "Propio",
    registeredAt: "2024-01-20",
    notes: "Pantalla con rayones menores",
  },
];

type SerialStatus = "available" | "reserved" | "sold" | "defective";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

function StatusBadge({ status }: { status: SerialStatus }) {
  const config = {
    available: {
      label: "Disponible",
      className:
        "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    },
    reserved: {
      label: "Apartado",
      className:
        "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    },
    sold: {
      label: "Vendido",
      className:
        "bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/20",
    },
    defective: {
      label: "Defectuoso",
      className:
        "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    },
  };

  const { label, className } = config[status];

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${className}`}
    >
      {label}
    </span>
  );
}

function OwnerBadge({ owner }: { owner: string }) {
  const isConsignment = owner.toLowerCase().includes("consignación");

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${
        isConsignment
          ? "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20"
          : "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20"
      }`}
    >
      {isConsignment ? owner.replace("Consignación - ", "") : owner}
    </span>
  );
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    // En una implementación real aquí iría un toast
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1 rounded text-muted-foreground hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      title={`Copiar ${label}`}
    >
      <Copy className="h-3.5 w-3.5" />
    </button>
  );
}

interface ProductDetailSheetUIProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductDetailSheetUI({
  open,
  onOpenChange,
}: ProductDetailSheetUIProps) {
  const availableCount = serialsData.filter(
    (s) => s.status === "available"
  ).length;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        {/* Overlay */}
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

        {/* Sheet Content */}
        <Dialog.Content className="fixed right-0 top-0 h-full w-full sm:max-w-2xl bg-background border-l border-slate-200 dark:border-slate-800 shadow-2xl z-50 flex flex-col data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right duration-300">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <Smartphone className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <Dialog.Title className="text-lg font-semibold text-foreground">
                  {productData.name}
                </Dialog.Title>
                <Dialog.Description className="text-sm text-muted-foreground mt-0.5">
                  Historial de seriales/IMEIs registrados
                </Dialog.Description>
              </div>
            </div>
            <Dialog.Close asChild>
              <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>

          {/* Stats rápidos */}
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-xs text-muted-foreground">Total Registrados</p>
                <p className="text-lg font-semibold text-foreground">
                  {serialsData.length}
                </p>
              </div>
              <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
              <div>
                <p className="text-xs text-muted-foreground">Disponibles</p>
                <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                  {availableCount}
                </p>
              </div>
              <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
              <div>
                <p className="text-xs text-muted-foreground">SKU</p>
                <p className="text-sm font-mono text-foreground">
                  {productData.sku}
                </p>
              </div>
            </div>
          </div>

          {/* Tabla de seriales */}
          <div className="flex-1 overflow-y-auto">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="sticky top-0 bg-background">
                  <tr className="border-b border-slate-200 dark:border-slate-800">
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Serial / IMEI
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="hidden md:table-cell px-4 md:px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Batería
                    </th>
                    <th className="hidden sm:table-cell px-4 md:px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Propietario
                    </th>
                    <th className="hidden lg:table-cell px-4 md:px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Costo
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Registro
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {serialsData.map((serial) => (
                    <tr
                      key={serial.id}
                      className={`group transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-900/30 ${
                        serial.status === "sold" ? "opacity-60" : ""
                      }`}
                    >
                      {/* Serial / IMEI */}
                      <td className="px-4 md:px-6 py-3.5">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-sm font-medium text-foreground">
                              {serial.serial}
                            </span>
                            {serial.status === "available" && (
                              <CopyButton text={serial.serial} label="Serial" />
                            )}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[11px] text-muted-foreground">
                              IMEI: {serial.imei}
                            </span>
                          </div>
                          {serial.notes && (
                            <p className="text-[10px] text-amber-600 dark:text-amber-400 truncate max-w-[180px]">
                              {serial.notes}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Estado */}
                      <td className="px-4 md:px-6 py-3.5">
                        <StatusBadge status={serial.status} />
                      </td>

                      {/* Batería */}
                      <td className="hidden md:table-cell px-4 md:px-6 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                serial.condition.battery >= 90
                                  ? "bg-emerald-500"
                                  : serial.condition.battery >= 80
                                    ? "bg-amber-500"
                                    : "bg-rose-500"
                              }`}
                              style={{ width: `${serial.condition.battery}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-muted-foreground tabular-nums">
                            {serial.condition.battery}%
                          </span>
                        </div>
                      </td>

                      {/* Propietario */}
                      <td className="hidden sm:table-cell px-4 md:px-6 py-3.5">
                        <OwnerBadge owner={serial.owner} />
                      </td>

                      {/* Costo */}
                      <td className="hidden lg:table-cell px-4 md:px-6 py-3.5">
                        <span className="text-sm text-muted-foreground font-medium tabular-nums">
                          {formatCurrency(serial.cost)}
                        </span>
                      </td>

                      {/* Fecha registro */}
                      <td className="px-4 md:px-6 py-3.5">
                        <span className="text-sm text-muted-foreground">
                          {new Date(serial.registeredAt).toLocaleDateString(
                            "es-ES",
                            {
                              day: "2-digit",
                              month: "short",
                            }
                          )}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                <Check className="inline h-3.5 w-3.5 mr-1 text-emerald-500" />
                {availableCount} unidades listas para venta
              </p>
              <button
                onClick={() => onOpenChange(false)}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
