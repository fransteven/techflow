"use server";
import { db } from "@/db";
import { owners } from "@/db/schema/inventory";
import { desc } from "drizzle-orm";

export async function getOwnersAction() {
  try {
    const data = await db.select().from(owners).orderBy(desc(owners.createdAt));
    return { success: true as const, data };
  } catch (error) {
    console.error("Error fetching owners:", error);
    return { success: false as const, error: "Error fetching owners" };
  }
}

export async function createOwnerAction(data: { name: string }) {
  try {
    const result = await db.insert(owners).values(data).returning();
    return { success: true as const, data: result[0] };
  } catch (error) {
    console.error("Error creating owner:", error);
    return { success: false as const, error: "Error creating owner" };
  }
}
