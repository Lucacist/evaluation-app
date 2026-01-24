"use server";

import { db } from "@/db";
import { groups, poles, activities, competenceBlocks, criteria, grades, referentials, enrollments, students } from "@/db/schema"; 
import { eq, desc, and, lt, gt, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// --- GESTION DES GROUPES ---

// AJOUT DE prevState: any
export async function createGroupAction(name: string, schoolYear: string, referentialId: number, color: string) {
  if (!name || !schoolYear || !referentialId) return { error: "Tous les champs sont requis" };

  const lastGroup = await db.select().from(groups).orderBy(desc(groups.position)).limit(1);
  const newPosition = lastGroup.length > 0 ? lastGroup[0].position + 1 : 0;

  await db.insert(groups).values({
    name,
    schoolYear,
    referentialId,
    color,
    position: newPosition,
  });
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateGroupAction(id: number, name: string, schoolYear: string, referentialId: number, color: string) {
  await db.update(groups)
    .set({ name, schoolYear, referentialId, color })
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

export async function moveGroupAction(groupId: number, direction: "up" | "down") {
  console.log("🚀 moveGroupAction appelée avec:", { groupId, direction });
  
  try {
    // 1. On récupère TOUS les groupes triés par position
    const allGroups = await db.select().from(groups).orderBy(asc(groups.position), asc(groups.id));
    console.log("📋 Groupes trouvés:", allGroups.map(g => ({ id: g.id, name: g.name, position: g.position })));
    
    // 2. On trouve l'index du groupe actuel
    const currentIndex = allGroups.findIndex(g => g.id === groupId);
    console.log("📍 Index actuel:", currentIndex);
    
    if (currentIndex === -1) {
      console.log("❌ Groupe introuvable");
      return { error: "Groupe introuvable" };
    }

    // 3. On calcule l'index du voisin
    const neighborIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    console.log("👉 Index voisin:", neighborIndex);
    
    // 4. On vérifie que le voisin existe
    if (neighborIndex < 0 || neighborIndex >= allGroups.length) {
      console.log("⚠️ Pas de voisin (déjà en haut ou en bas)");
      return { success: false }; // Déjà tout en haut ou tout en bas
    }

    const currentGroup = allGroups[currentIndex];
    const neighbor = allGroups[neighborIndex];
    console.log("🔄 Échange entre:", { current: currentGroup.name, neighbor: neighbor.name });

    // 5. On échange les positions (SWAP)
    const currentPos = currentGroup.position;
    const neighborPos = neighbor.position;
    
    const newCurrentPos = neighborPos !== currentPos ? neighborPos : neighborIndex;
    const newNeighborPos = neighborPos !== currentPos ? currentPos : currentIndex;
    console.log("📊 Nouvelles positions:", { currentGroup: newCurrentPos, neighbor: newNeighborPos });
    
    // Pas de transaction avec neon-http, on fait les updates séparément
    // On utilise une position temporaire (-1) pour éviter les conflits d'unicité
    await db.update(groups)
      .set({ position: -1 })
      .where(eq(groups.id, currentGroup.id));

    await db.update(groups)
      .set({ position: newNeighborPos })
      .where(eq(groups.id, neighbor.id));

    await db.update(groups)
      .set({ position: newCurrentPos })
      .where(eq(groups.id, currentGroup.id));

    console.log("✅ Transaction terminée, revalidation...");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (e) {
    console.error("💥 Erreur:", e);
    return { error: "Erreur lors du déplacement" };
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