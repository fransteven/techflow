import { z } from "zod";

// Schema for searching products by barcode/SKU
export const searchProductSchema = z.object({
  barcode: z.string().min(1, "Código de barras requerido"),
});

// Schema for a single sale item
export const saleItemSchema = z.object({
  productItemId: z.string().uuid().nullable(),
  productId: z.string().uuid(),
  price: z.number().positive("El precio debe ser positivo"),
  quantity: z.number().int().positive().default(1),
  isSerialized: z.boolean(),
});

// Schema for processing a complete sale
export const processSaleSchema = z.object({
  items: z.array(saleItemSchema).min(1, "Debe agregar al menos un producto"),
  totalAmount: z.number().positive("El total debe ser positivo"),
  userId: z.string().optional(),
});

export type SearchProductInput = z.infer<typeof searchProductSchema>;
export type SaleItem = z.infer<typeof saleItemSchema>;
export type ProcessSaleInput = z.infer<typeof processSaleSchema>;

// Return type for product search
export type ProductSearchResult = {
  productId: string;
  productItemId: string | null;
  name: string;
  suggestedPrice: string;
  availableQty: number;
  avgUnitCost: number;
  isSerialized: boolean;
  sku: string | null;
};
