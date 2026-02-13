"use client";

import { useState } from "react";
import { PosProductList } from "@/components/pos/pos-product-list";
import { toast } from "sonner";
import { Trash2, CreditCard, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { processSaleAction } from "@/app/actions/pos-action";
import { formatCurrency } from "@/lib/formatters";

interface CartItem {
  productId: string;
  productItemId: string | null;
  name: string;
  price: number;
  isSerialized: boolean;
  quantity: number;
  unitCost: number;
  availableQty?: number; // Track available quantity for validation
}

export default function PosPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [processing, setProcessing] = useState(false);

  const handleAddToCart = (item: CartItem) => {
    setCartItems((prev) => {
      // If serialized, it's always a new entry because productItemId is unique
      if (item.isSerialized) {
        // Prevent double adding same serial if scanned twice
        if (prev.some((p) => p.productItemId === item.productItemId)) {
          toast.warning("Este serial ya está en el carrito");
          return prev;
        }
        toast.success(`${item.name} añadido`);
        return [...prev, item];
      }

      // If NOT serialized, check if same productId already exists with SAME price
      const existing = prev.find(
        (p) => p.productId === item.productId && p.price === item.price,
      );

      if (existing) {
        // Check if adding one more would exceed available quantity
        const newQuantity = existing.quantity + 1;
        if (
          item.availableQty !== undefined &&
          newQuantity > item.availableQty
        ) {
          toast.error(
            `Stock insuficiente. Disponible: ${item.availableQty}, en carrito: ${existing.quantity}`,
          );
          return prev;
        }

        toast.success(`Cantidad de ${item.name} actualizada`);
        return prev.map((p) =>
          p.productId === item.productId && p.price === item.price
            ? { ...p, quantity: newQuantity }
            : p,
        );
      }

      // Adding new item - check if available quantity is sufficient
      if (item.availableQty !== undefined && item.availableQty < 1) {
        toast.error(`${item.name} no tiene stock disponible`);
        return prev;
      }

      toast.success(`${item.name} añadido`);
      return [...prev, item];
    });
  };

  const handleRemoveItem = (index: number) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;

    setProcessing(true);
    const totalAmount = cartItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0,
    );

    try {
      const response = await processSaleAction({
        items: cartItems.map((item) => ({
          productId: item.productId,
          productItemId: item.productItemId, // Allow null
          price: item.price,
          quantity: item.quantity,
          isSerialized: item.isSerialized,
        })),
        totalAmount: totalAmount,
      });

      if (response.success) {
        toast.success("Venta completada", {
          description: `Transacción #${response.saleId} registrada exitosamente.`,
        });
        setCartItems([]);
      } else {
        toast.error("Error al procesar venta", {
          description: response.error,
        });
      }
    } catch (error) {
      toast.error("Error crítico en el checkout");
    } finally {
      setProcessing(false);
    }
  };

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const tax = subtotal * 0.16; // 16% example
  const total = subtotal + tax;

  return (
    <div className="flex h-[calc(100vh-theme(spacing.16)-1px)] gap-6 -m-4 p-4">
      {/* Left Column: Product Search & Table */}
      <div className="flex-[3] min-w-0 bg-card rounded-xl border p-6 flex flex-col shadow-sm">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Terminal de Ventas
        </h2>
        <PosProductList onAddToCart={handleAddToCart} />
      </div>

      {/* Right Column: Dynamic Cart */}
      <div className="flex-[2] min-w-[380px] max-w-[500px] flex flex-col bg-card border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-muted/30">
          <h3 className="font-semibold flex items-center gap-2">
            Carrito de Compras
            <Badge variant="secondary" className="rounded-full">
              {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
            </Badge>
          </h3>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="p-3 border-b text-[10px] uppercase font-bold tracking-wider text-muted-foreground grid grid-cols-12 gap-2">
            <div className="col-span-6">Producto / Especificaciones</div>
            <div className="col-span-2 text-center">Cant.</div>
            <div className="col-span-3 text-right">Subtotal</div>
            <div className="col-span-1"></div>
          </div>

          <ScrollArea className="flex-1">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground px-8 text-center">
                <ShoppingCart className="h-12 w-12 mb-4 opacity-10" />
                <p className="font-medium">El carrito está vacío</p>
                <p className="text-xs opacity-60">
                  Escanea productos para agregarlos
                </p>
              </div>
            ) : (
              <div className="flex flex-col">
                {cartItems.map((item, index) => (
                  <div
                    key={`${item.productItemId || item.productId}-${index}`}
                    className="grid grid-cols-12 gap-2 p-4 text-sm items-center border-b last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <div className="col-span-6 font-medium">
                      <div className="truncate">{item.name}</div>
                      <div className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono">
                          {formatCurrency(item.price)}
                        </span>
                        <span>•</span>
                        <Badge
                          variant="outline"
                          className="text-[8px] py-0 px-1 leading-none uppercase"
                        >
                          {item.isSerialized ? "Serial" : "Stock"}
                        </Badge>
                      </div>
                    </div>
                    <div className="col-span-2 text-center font-semibold">
                      {item.quantity}
                    </div>
                    <div className="col-span-3 text-right font-bold">
                      {formatCurrency(item.price * item.quantity)}
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => handleRemoveItem(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        <div className="p-6 bg-muted/30 border-t space-y-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">IVA (16%)</span>
              <span className="font-medium">{formatCurrency(tax)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between text-2xl font-black text-primary">
              <span>TOTAL</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>

          <Button
            className="w-full text-lg h-14 font-bold shadow-lg"
            size="lg"
            disabled={cartItems.length === 0 || processing}
            onClick={handleCheckout}
          >
            {processing ? (
              "Procesando..."
            ) : (
              <>
                <CreditCard className="mr-2 h-5 w-5" />
                Finalizar Venta
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
