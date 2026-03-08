"use server";

import { revalidatePath } from "next/cache";
import { createLayaway, getLayaways, getLayawayDetails, addLayawayPayment, cancelLayaway } from "@/services/layaway-service";
import { createLayawaySchema, addLayawayPaymentSchema } from "@/lib/validators/layaway-validator";

export async function getLayawaysAction() {
  try {
    const data = await getLayaways();
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching layaways:", error);
    return { success: false, error: "Error al cargar los apartados" };
  }
}

export async function createLayawayAction(data: unknown) {
  const validation = createLayawaySchema.safeParse(data);

  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message };
  }

  try {
    const layaway = await createLayaway(validation.data);
    
    revalidatePath("/pos");
    revalidatePath("/inventory");
    revalidatePath("/layaways"); 
    
    return { success: true, data: layaway };
  } catch (error) {
    console.error("Error creating layaway:", error);
    const err = error as Error;
    return { success: false, error: err.message || "Error al procesar el apartado." };
  }
}

export async function getLayawayDetailsAction(layawayId: string) {
  try {
    const data = await getLayawayDetails(layawayId);
    return { success: true, data };
  } catch (error) {
    return { success: false, error: "Error al cargar los detalles." };
  }
}

export async function addLayawayPaymentAction(data: unknown) {
  const validation = addLayawayPaymentSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, error: validation.error.issues[0].message };
  }
  
  try {
    await addLayawayPayment(validation.data);
    revalidatePath("/layaways");
    revalidatePath("/inventory");
    return { success: true };
  } catch (error) {
    const err = error as Error;
    return { success: false, error: err.message || "Error al procesar el pago." };
  }
}

export async function cancelLayawayAction(layawayId: string) {
  try {
    await cancelLayaway(layawayId);
    revalidatePath("/layaways");
    revalidatePath("/inventory");
    return { success: true };
  } catch (error) {
    const err = error as Error;
    return { success: false, error: err.message || "Error al cancelar el apartado." };
  }
}
