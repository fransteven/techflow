import { z } from "zod";

export const receiveStockSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive("Quantity must be a positive number"),
  unitCost: z.number().positive("Unit cost must be a positive number"),
  serials: z.array(z.string().min(1)).optional(),
});

// Schema for the UI Form (client-side)
export const receiveStockFormSchema = z.object({
  productId: z.string().min(1, "Seleccione un producto."),
  unitCost: z.coerce.number().positive("El costo debe ser positivo."),
  serials: z.string().min(3, {
    message: "Ingrese al menos un serial.",
  }),
  notes: z.string().optional(),
});

export type ReceiveStockFormValues = z.infer<typeof receiveStockFormSchema>;

export type InventoryItem = {
  id: string;
  serial: string | null;
  sku: string | null;
  status: string;
  createdAt: Date;
  productName: string | null;
  productId: string | null;
  soldDate: Date | null;
};

export type ReceiveStockInput = z.infer<typeof receiveStockSchema>;

export type InventoryMovement = {
  id: string;
  type: string;
  quantity: number;
  reason: string | null;
  createdAt: Date;
  unitCost: string | null;
  productName: string | null;
  productId: string | null;
  serialNumber: string | null;
  productItemId: string | null;
};
