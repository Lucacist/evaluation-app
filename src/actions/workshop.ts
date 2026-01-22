"use server";

import { db } from "@/db";
import { students, studentTps } from "@/db/schema";
import { eq, and, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// AFFECTER UN VÉHICULE
export async function assignVehicleAction(studentId: number, vehicleId: number | null, groupId: number) {
  // 1. Si on essaie d'assigner un véhicule (pas null)
  if (vehicleId) {
    // Vérifier si le véhicule est déjà pris par QUELQU'UN D'AUTRE DANS LE GROUPE (ou globalement selon ton besoin)
    // Ici on check globalement pour simplifier (un véhicule n'est pas à 2 endroits à la fois)
    const existingAssignment = await db.query.students.findFirst({
      where: and(
        eq(students.currentVehicleId, vehicleId),
        ne(students.id, studentId) // C'est pas moi qui l'ai déjà
      )
    });

    if (existingAssignment) {
      return { error: `Véhicule déjà utilisé par ${existingAssignment.firstName} ${existingAssignment.lastName}` };
    }
  }

  // 2. Affectation
  await db.update(students)
    .set({ currentVehicleId: vehicleId })
    .where(eq(students.id, studentId));

  revalidatePath("/dashboard/settings"); // On rafraichit la page
  return { success: true };
}

// AFFECTER UN TP
export async function assignTpAction(studentId: number, tpId: number | null) {
  // 1. Mise à jour de l'état actuel
  await db.update(students)
    .set({ currentTpId: tpId })
    .where(eq(students.id, studentId));

  // 2. Historisation (Si on assigne un TP, on l'ajoute à l'historique)
  if (tpId) {
    await db.insert(studentTps).values({
      studentId,
      tpId,
    });
  }

  revalidatePath("/dashboard/settings");
  return { success: true };
}

// RAZ VÉHICULES DU GROUPE
export async function resetGroupVehiclesAction(groupId: number) {
  // On récupère d'abord les IDs des élèves du groupe via enrollments
  // Mais ici on va faire simple : on clean les véhicules de TOUS les élèves qui sont affichés
  // Mieux : il faudrait faire une jointure.
  // Pour l'instant, supposons qu'on passe les IDs des élèves affichés à l'écran, ou qu'on fasse une sous-requête.
  
  // Méthode propre via jointure implicite si possible, sinon brute :
  // On met à NULL currentVehicleId pour tous les élèves qui ont une inscription dans ce groupe.
  
  // NOTE : Drizzle update avec join est complexe. On va faire simple :
  // On a besoin de la liste des studentIds du groupe.
  
  // Solution Client -> Server : on passera la liste des IDs à nettoyer, ou on fait une requête imbriquée.
  // Faisons une requête imbriquée SQL brute ou via l'API.
  
  // Pour simplifier l'exemple, supposons que tu veuilles RAZ tous les élèves affichés.
  // Le plus simple :
  /* UPDATE students SET current_vehicle_id = NULL 
     WHERE id IN (SELECT student_id FROM enrollments WHERE group_id = X)
  */
  
  // On va le faire en 2 temps avec Drizzle pour être sûr :
  // 1. Get IDs
  const groupStudents = await db.query.enrollments.findMany({
    where: (enrollments, { eq }) => eq(enrollments.groupId, groupId),
    columns: { studentId: true }
  });
  
  const ids = groupStudents.map(e => e.studentId);
  
  if (ids.length > 0) {
    await db.update(students)
      .set({ currentVehicleId: null })
      .where(inArray(students.id, ids));
  }

  revalidatePath("/dashboard/settings");
  return { success: true };
}
import { enrollments } from "@/db/schema";
import { inArray } from "drizzle-orm";