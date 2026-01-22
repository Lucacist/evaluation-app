"use server";

import { db } from "@/db";
import { students, studentTps, enrollments } from "@/db/schema";
import { eq, and, ne, inArray, isNotNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// --- 1. AFFECTER UN VÉHICULE (Garde ça, c'est bon) ---
export async function assignVehicleAction(studentId: number, vehicleId: number | null, groupId: number) {
  if (vehicleId) {
    // Vérifier si le véhicule est déjà pris par quelqu'un d'autre
    const existingAssignment = await db.query.students.findFirst({
      where: and(
        eq(students.currentVehicleId, vehicleId),
        ne(students.id, studentId)
      )
    });

    if (existingAssignment) {
      return { error: `Véhicule déjà utilisé par ${existingAssignment.firstName} ${existingAssignment.lastName}` };
    }
  }

  await db.update(students)
    .set({ currentVehicleId: vehicleId })
    .where(eq(students.id, studentId));

  revalidatePath("/dashboard");
  return { success: true };
}

// --- 2. AFFECTER UN TP (MODIFIÉ : On retire l'historique ici) ---
export async function assignTpAction(studentId: number, tpId: number | null) {
  // On met juste à jour l'état actuel. On n'enregistre PAS encore dans l'historique.
  await db.update(students)
    .set({ currentTpId: tpId })
    .where(eq(students.id, studentId));

  revalidatePath("/dashboard");
  return { success: true };
}

// --- 3. NOUVEAU : ENREGISTRER LA SÉANCE (Historique global) ---
export async function saveSessionHistoryAction(groupId: number) {
  try {
    // A. Trouver les élèves du groupe qui ont un TP assigné
    const studentsInGroup = await db
      .select({
        id: students.id,
        currentTpId: students.currentTpId,
      })
      .from(students)
      .innerJoin(enrollments, eq(enrollments.studentId, students.id))
      .where(
        and(
          eq(enrollments.groupId, groupId),
          isNotNull(students.currentTpId) // Seulement ceux qui travaillent
        )
      );

    if (studentsInGroup.length === 0) {
      return { success: true, count: 0 };
    }

    // B. Créer les entrées d'historique
    const historyEntries = studentsInGroup.map((s) => ({
      studentId: s.id,
      tpId: s.currentTpId!, 
      assignedAt: new Date(),
    }));

    await db.insert(studentTps).values(historyEntries);

    revalidatePath(`/dashboard/groups/${groupId}`);
    return { success: true, count: historyEntries.length };
  } catch (error) {
    console.error("Erreur sauvegarde historique:", error);
    return { error: "Impossible de sauvegarder l'historique." };
  }
}

// --- 4. RAZ (NETTOYAGE) ---
// J'ai combiné le nettoyage Véhicules et TPs pour ton bouton "Fin de séance"
export async function resetGroupAction(groupId: number) {
  try {
    // Récupérer les ID des élèves du groupe
    const groupStudents = await db.query.enrollments.findMany({
      where: (enrollments, { eq }) => eq(enrollments.groupId, groupId),
      columns: { studentId: true }
    });
    
    const ids = groupStudents.map(e => e.studentId);
    
    if (ids.length > 0) {
      // On remet tout à NULL (Véhicule ET Tp)
      await db.update(students)
        .set({ 
          currentVehicleId: null,
          currentTpId: null 
        })
        .where(inArray(students.id, ids));
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch (e) {
    return { error: "Erreur lors du nettoyage de la séance" };
  }
}

// --- 5. AJOUT MANUEL D'UN HISTORIQUE ---
export async function addHistoryEntryAction(studentId: number, tpId: number, date: Date) {
  try {
    await db.insert(studentTps).values({
      studentId,
      tpId,
      assignedAt: date,
    });
    revalidatePath(`/dashboard/students/${studentId}`);
    return { success: true };
  } catch (e) {
    return { error: "Erreur lors de l'ajout" };
  }
}

// --- 6. SUPPRIMER UN HISTORIQUE ---
export async function deleteHistoryEntryAction(historyId: number, studentId: number) {
  try {
    await db.delete(studentTps).where(eq(studentTps.id, historyId));
    revalidatePath(`/dashboard/students/${studentId}`);
    return { success: true };
  } catch (e) {
    return { error: "Erreur lors de la suppression" };
  }
}