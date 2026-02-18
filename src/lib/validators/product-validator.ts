import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  categoryId: z.string().optional(),
  description: z.string().optional(),
  price: z.string().refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "Price must be a valid positive number",
  }),
  isSerialized: z.boolean(),
  attributes: z.record(z.string(), z.any()).optional(),
});

export type ProductInput = z.infer<typeof productSchema>;
