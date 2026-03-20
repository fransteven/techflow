import { z } from "zod";

export const CONDITION_OPTIONS = [
  "EXCELLENT",
  "GOOD",
  "FAIR",
  "A",
  "B",
  "C",
  "D",
  "F",
] as const;

export const STATUS_OPTIONS = ["cotizacion", "comprado"] as const;

export const createImportCostSchema = z
  .object({
    productId: z.string().uuid("Selecciona un producto válido"),
    productItemId: z.string().uuid().optional().nullable(),
    purchaseDate: z.coerce.date(),
    condition: z.enum(CONDITION_OPTIONS, {
      message: "Selecciona una condición válida",
    }),
    provider: z.string().optional(),
    status: z.enum(STATUS_OPTIONS).default("cotizacion"),

    // Costo base
    baseUsdCost: z.coerce
      .number()
      .positive("El costo base debe ser mayor a 0"),

    // Mastercard Nu
    useMastercardNu: z.boolean().default(false),
    mastercardDollarRate: z.coerce.number().positive().optional().nullable(),

    // Casillero
    casilleroUsdCost: z.coerce
      .number()
      .positive("El costo del casillero debe ser mayor a 0")
      .default(50),
    casilleroTrm: z.coerce
      .number()
      .positive("Ingresa el TRM del casillero"),

    // Dólar producto
    productTrm: z.coerce
      .number()
      .positive("Ingresa el TRM del producto"),

    // Aranceles
    customsTariffPesos: z.coerce.number().min(0).default(0),

    // Especificaciones de la variante (storage, color, ram…)
    // Poblado desde el template de la categoría del producto
    specs: z.record(z.string(), z.string()).optional().nullable(),

    notes: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.useMastercardNu) {
        return (
          data.mastercardDollarRate != null && data.mastercardDollarRate > 0
        );
      }
      return true;
    },
    {
      message: "Ingresa el TRM de NuBank para calcular la comisión",
      path: ["mastercardDollarRate"],
    },
  );

export type CreateImportCostInput = z.infer<typeof createImportCostSchema>;
