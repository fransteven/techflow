'use client';

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ValidationItem } from '@/constants/iphone-check-list';
import { Info, AlertTriangle, ShieldCheck } from 'lucide-react';

interface ProtocolSheetProps {
  item: ValidationItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProtocolSheet({ item, isOpen, onClose }: ProtocolSheetProps) {
  if (!item) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        <SheetHeader className="space-y-4">
          <div className="p-3 w-fit rounded-full bg-primary/10 text-primary">
            <Info className="h-6 w-6" />
          </div>
          <div>
            <SheetTitle className="text-xl font-bold flex items-center gap-2">
              Protocolo Técnico:
              <span className="text-primary">{item.label}</span>
            </SheetTitle>
            <SheetDescription className="mt-2 text-base leading-relaxed">
              Siga estas instrucciones detalladas para validar el equipo. No omita ningún paso.
            </SheetDescription>
          </div>
        </SheetHeader>

        <div className="mt-8 space-y-6">
          <div className="p-4 rounded-xl border bg-muted/30 space-y-3">
            <div className="flex items-center gap-2 font-semibold text-sm">
              <ShieldCheck className="h-4 w-4 text-green-500" />
              Técnica de Inspección
            </div>
            <p className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">
              {item.fullProtocol}
            </p>
          </div>

          {item.isCritical && (
            <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 space-y-3">
              <div className="flex items-center gap-2 font-semibold text-sm text-red-500">
                <AlertTriangle className="h-4 w-4" />
                Criterio de Rechazo Inmediato
              </div>
              <p className="text-sm text-red-500/80 italic">
                Si este ítem falla o no cumple con los requisitos técnicos, se debe descartar la compra del equipo de inmediato por motivos de seguridad o hardware dañado.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Recomendación Pro</h5>
            <p className="text-xs text-muted-foreground">
              Utilice una luz blanca intensa y una lupa si es necesario para detectar micro-rayaduras o rastros de humedad en los puertos.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
