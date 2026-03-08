"use client";

import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, UserPlus, X } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import {
  searchCustomersAction,
  createCustomerAction,
} from "@/app/actions/customer-actions";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export interface Customer {
  id: string;
  documentId: string | null;
  name: string;
  phone: string | null;
  email: string | null;
}

interface CustomerSelectorProps {
  onSelect: (customer: Customer | null) => void;
  selectedCustomer: Customer | null;
}

export function CustomerSelector({
  onSelect,
  selectedCustomer,
}: CustomerSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);

  // Dialog para crear cliente nuevo
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    documentId: "",
    name: "",
    phone: "",
    email: "",
  });

  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    async function fetchCustomers() {
      if (debouncedSearch.length < 2) {
        setCustomers([]);
        return;
      }
      setLoading(true);
      const res = await searchCustomersAction(debouncedSearch);
      if (res.success && res.data) {
        setCustomers(res.data);
      }
      setLoading(false);
    }

    fetchCustomers();
  }, [debouncedSearch]);

  const handleCreateCustomer = async () => {
    if (!newCustomer.documentId || !newCustomer.name) {
      toast.error("Documento y Nombre son obligatorios");
      return;
    }

    const res = await createCustomerAction(newCustomer);
    if (res.success && res.data) {
      toast.success("Cliente registrado exitosamente");
      onSelect(res.data);
      setCreateDialogOpen(false);
      setOpen(false);
      // Limpiar form
      setNewCustomer({ documentId: "", name: "", phone: "", email: "" });
    } else {
      toast.error(res.error || "Error al crear cliente");
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Cliente Asociado
        </Label>
        {selectedCustomer && (
          <Button
            variant="ghost"
            size="sm"
            className="h-5 px-2 text-xs text-muted-foreground"
            onClick={() => onSelect(null)}
          >
            <X className="h-3 w-3 mr-1" />
            Remover
          </Button>
        )}
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal"
          >
            {selectedCustomer ? (
              <div className="flex items-center truncate">
                <span className="truncate">{selectedCustomer.name}</span>
                {selectedCustomer.documentId && (
                  <span className="ml-2 text-muted-foreground text-xs">
                    ({selectedCustomer.documentId})
                  </span>
                )}
              </div>
            ) : (
              <span className="text-muted-foreground">
                Consumidor Final (Venta Anónima)
              </span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[350px] p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Buscar por cédula o nombre..."
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              {loading && <div className="p-4 text-center text-sm text-muted-foreground">Buscando...</div>}
              {!loading && customers.length === 0 && searchQuery.length >= 2 && (
                <CommandEmpty className="py-6 text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    No se encontró a &quot;{searchQuery}&quot;
                  </p>
                  <Button
                    size="sm"
                    onClick={() => {
                      setNewCustomer((prev) => ({ ...prev, name: searchQuery }));
                      setCreateDialogOpen(true);
                      setOpen(false);
                    }}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Registrar Cliente Nuevo
                  </Button>
                </CommandEmpty>
              )}
              <CommandGroup>
                {customers.map((customer) => (
                  <CommandItem
                    key={customer.id}
                    value={customer.id}
                    onSelect={() => {
                      onSelect(customer);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedCustomer?.id === customer.id
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    <div className="flex flex-col">
                      <span>{customer.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {customer.documentId} {customer.phone ? `• ${customer.phone}` : ""}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
            
            {/* Action fija al final del popover */}
            <div className="p-2 border-t bg-muted/30">
              <Button 
                variant="ghost" 
                className="w-full justify-start text-sm h-8"
                onClick={() => {
                  setCreateDialogOpen(true);
                  setOpen(false);
                }}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Registrar Cliente Nuevo
              </Button>
            </div>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Dialogo para crear cliente */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Registrar Nuevo Cliente</DialogTitle>
            <DialogDescription>
              Añade los datos del cliente para asociarlos a sus compras o apartados.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="doc" className="text-right text-xs">
                Cédula/NIT *
              </Label>
              <Input
                id="doc"
                value={newCustomer.documentId}
                onChange={(e) => setNewCustomer({ ...newCustomer, documentId: e.target.value })}
                className="col-span-3"
                placeholder="Ej: 10203040"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right text-xs">
                Nombre *
              </Label>
              <Input
                id="name"
                value={newCustomer.name}
                onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                className="col-span-3"
                placeholder="Ej: Juan Pérez"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right text-xs">
                Teléfono
              </Label>
              <Input
                id="phone"
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                className="col-span-3"
                placeholder="Ej: 300 123 4567"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreateCustomer}>Guardar y Seleccionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
