"use server";

import { db } from "@/db";
import { tps, vehicles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// --- GESTION DES TPs ---

export async function createTpAction(title: string, category: string, color: string) {
  try {
    await db.insert(tps).values({ title, category, color });
    revalidatePath("/dashboard/workshop");
    return { success: true };
  } catch (e) {
    return { error: "Erreur création TP" };
  }
}

export async function deleteTpAction(id: number) {
  try {
    await db.delete(tps).where(eq(tps.id, id));
    revalidatePath("/dashboard/workshop");
    return { success: true };
  } catch (e) {
    return { error: "Erreur suppression TP" };
  }
}

// --- GESTION DES VÉHICULES ---

export async function createVehicleAction(name: string, plate: string) {
  try {
    await db.insert(vehicles).values({ name, plate, status: "available" });
    revalidatePath("/dashboard/workshop");
    return { success: true };
  } catch (e) {
    return { error: "Erreur création Véhicule" };
  }
}

export async function deleteVehicleAction(id: number) {
  try {
    await db.delete(vehicles).where(eq(vehicles.id, id));
    revalidatePath("/dashboard/workshop");
    return { success: true };
  } catch (e) {
    return { error: "Erreur suppression Véhicule" };
  }
}