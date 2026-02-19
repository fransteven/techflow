"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { receiveStockAction } from "@/app/actions/inventory-actions";
import { ProductWithStock } from "@/services/product-service";

import { PrintLabelsDialog, PrintData } from "./print-labels-dialog";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AddStockSheetProps {
  products: ProductWithStock[];
}

// Dynamic schema based on product type
const createFormSchema = (isSerialized: boolean) => {
  return z.object({
    productId: z.string().min(1, "Seleccione un producto."),
    quantity: z.coerce
      .number()
      .int()
      .positive("La cantidad debe ser positiva."),
    unitCost: z.coerce.number().positive("El costo debe ser positivo."),
    serials: isSerialized
      ? z.array(z.string().min(1, "El IMEI no puede estar vacío"))
      : z.array(z.string()).optional(),
  });
};

type FormValues = z.infer<ReturnType<typeof createFormSchema>>;

export function AddStockSheet({ products }: AddStockSheetProps) {
  const [open, setOpen] = useState(false);
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [printData, setPrintData] = useState<PrintData | null>(null);
  const [selectedProduct, setSelectedProduct] =
    useState<ProductWithStock | null>(null);
  const [imeiCount, setImeiCount] = useState(0);

  const form = useForm<any>({
    resolver: zodResolver(
      createFormSchema(selectedProduct?.isSerialized ?? false),
    ),
    defaultValues: {
      productId: "",
      quantity: "",
      unitCost: "",
      serials: [],
    },
  });

  // ... existing form setup

  async function onSubmit(values: FormValues) {
    // Validation for serialized products
    if (selectedProduct?.isSerialized) {
      const filledSerials =
        values.serials?.filter((s) => s && s.trim().length > 0) || [];
      if (filledSerials.length !== values.quantity) {
        toast.error("Error de validación", {
          description: `Debe ingresar exactamente ${values.quantity} IMEIs.`,
        });
        return;
      }
    }

    const result = await receiveStockAction({
      productId: values.productId,
      quantity: values.quantity,
      unitCost: values.unitCost,
      serials: selectedProduct?.isSerialized ? values.serials : undefined,
    });

    if (result.success) {
      toast.success("Entrada registrada", {
        description: `Se agregaron ${values.quantity} unidad(es) al inventario.`,
      });
      setOpen(false);

      // Prepare print data
      if (result.type === "serialized") {
        setPrintData({ type: "serialized", items: result.items });
      } else if (result.type === "generic") {
        setPrintData({
          type: "generic",
          product: result.product,
          quantity: result.quantity || values.quantity,
        });
      }

      setPrintDialogOpen(true);

      form.reset();
      setSelectedProduct(null);
      setImeiCount(0);
    } else {
      toast.error("Error al registrar entrada", {
        description: result.error,
      });
    }
  }

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button size="lg">
            <Plus className="mr-2 h-4 w-4" />
            Registrar Entrada / Compra
          </Button>
        </SheetTrigger>
        <SheetContent className="flex flex-col overflow-y-auto sm:max-w-lg">
          <SheetHeader className="space-y-2 pb-4">
            <SheetTitle>Registrar Entrada / Compra</SheetTitle>
            <SheetDescription>
              Registra la entrada de mercancía a la bodega. Los campos se
              ajustan según el tipo de producto.
            </SheetDescription>
          </SheetHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col gap-4 py-4"
            >
              {/* Paso 1: Selección del Producto */}
              <FormField
                control={form.control}
                name="productId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Producto *</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        const product = products.find((p) => p.id === value);
                        setSelectedProduct(product || null);
                        setImeiCount(0);
                        form.setValue("quantity", "");
                        form.setValue("serials", []);
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Buscar y seleccionar producto..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name}
                            {product.isSerialized && " (Serializado)"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Paso 2: Inputs Básicos */}
              {selectedProduct && (
                <>
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cantidad *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            placeholder="Ej: 3"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e);
                              const val = parseInt(e.target.value);
                              setImeiCount(isNaN(val) ? 0 : val);
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          Número de unidades que están ingresando
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="unitCost"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Costo Unitario *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="$0.00"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Precio de compra por unidad
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Paso 3: Campos Dinámicos de IMEI (Solo para productos serializados) */}
                  {selectedProduct.isSerialized && imeiCount > 0 && (
                    <div className="space-y-3 border-t pt-4">
                      <div className="space-y-1">
                        <h4 className="font-medium text-sm">
                          Seriales / IMEIs ({imeiCount} requeridos)
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          Puede usar el lector de código de barras en cada campo
                        </p>
                      </div>
                      {Array.from({ length: imeiCount }).map((_, index) => (
                        <FormField
                          key={index}
                          control={form.control}
                          name={`serials.${index}`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>IMEI #{index + 1}</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder={`Escanear o escribir IMEI #${index + 1}`}
                                  autoFocus={index === 0}
                                  {...field}
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  )}

                  {/* Info para productos NO serializados */}
                  {!selectedProduct.isSerialized && (
                    <div className="rounded-md bg-muted p-3 text-sm">
                      <p className="text-muted-foreground">
                        Este producto no requiere seriales. Solo ingrese la
                        cantidad y el costo unitario.
                      </p>
                    </div>
                  )}
                </>
              )}

              <SheetFooter className="pt-4">
                <Button
                  type="submit"
                  disabled={!selectedProduct}
                  className="w-full"
                >
                  Registrar Entrada
                </Button>
              </SheetFooter>
            </form>
          </Form>
        </SheetContent>
      </Sheet>

      <PrintLabelsDialog
        open={printDialogOpen}
        onOpenChange={setPrintDialogOpen}
        data={printData}
      />
    </>
  );
}
