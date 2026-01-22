"use server";

import { db } from "@/db";
import { groups, poles, activities, competenceBlocks, criteria, grades, referentials, enrollments, students } from "@/db/schema";import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// --- GESTION DES GROUPES ---

// AJOUT DE prevState: any
export async function createGroupAction(name: string, schoolYear: string, referentialId: number) {
  if (!name || !schoolYear || !referentialId) return { error: "Tous les champs sont requis" };
  
  await db.insert(groups).values({ 
    name, 
    schoolYear,
    referentialId 
  });
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateGroupAction(id: number, name: string, schoolYear: string, referentialId: number) {
  await db.update(groups)
    .set({ name, schoolYear, referentialId })
    .where(eq(groups.id, id));
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteGroupAction(id: number) {
  try {
    // Drizzle gère les cascades si configuré, mais par sécurité :
    // 1. Supprimer les inscriptions
    await db.delete(enrollments).where(eq(enrollments.groupId, id));
    // 2. Supprimer le groupe
    await db.delete(groups).where(eq(groups.id, id));
    
    revalidatePath("/dashboard");
    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: "Erreur lors de la suppression" };
  }
}

// --- GESTION DU RÉFÉRENTIEL (Générique) ---

export async function createPoleAction(title: string, order: number) {
  await db.insert(poles).values({ title, order });
  revalidatePath("/dashboard/settings");
}
export async function deletePoleAction(id: number) {
  await db.delete(poles).where(eq(poles.id, id));
  revalidatePath("/dashboard/settings");
}

export async function createActivityAction(poleId: number, title: string, code: string) {
  const existing = await db.select().from(activities).where(eq(activities.poleId, poleId));
  const order = existing.length + 1;
  await db.insert(activities).values({ poleId, title, code, order });
  revalidatePath("/dashboard/settings");
}
export async function deleteActivityAction(id: number) {
  await db.delete(activities).where(eq(activities.id, id));
  revalidatePath("/dashboard/settings");
}

export async function createBlockAction(activityId: number, title: string, code: string) {
  const existing = await db.select().from(competenceBlocks).where(eq(competenceBlocks.activityId, activityId));
  await db.insert(competenceBlocks).values({ activityId, title, code, order: existing.length + 1 });
  revalidatePath("/dashboard/settings");
}
export async function deleteBlockAction(id: number) {
  await db.delete(competenceBlocks).where(eq(competenceBlocks.id, id));
  revalidatePath("/dashboard/settings");
}

export async function createCriterionAction(blockId: number, label: string) {
  const existing = await db.select().from(criteria).where(eq(criteria.blockId, blockId));
  await db.insert(criteria).values({ blockId, label, order: existing.length + 1, weight: 1 });
  revalidatePath("/dashboard/settings");
}
export async function deleteCriterionAction(id: number) {
  await db.delete(criteria).where(eq(criteria.id, id));
  revalidatePath("/dashboard/settings");
}