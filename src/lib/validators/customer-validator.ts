import { z } from "zod";

export const customerSchema = z.object({
  documentId: z.string().min(4, "Document ID is required"),
  name: z.string().min(2, "Name is required"),
  phone: z.string().optional(),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
});

export type CustomerInput = z.infer<typeof customerSchema>;
