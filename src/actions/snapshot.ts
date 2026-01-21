"use server";

import { db } from "@/db";
import { assessments, grades } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createSnapshotAction(sourceAssessmentId: number, title: string) {
  try {
    // 1. Récupérer le bilan source (Actif)
    const [source] = await db.select().from(assessments).where(eq(assessments.id, sourceAssessmentId));
    if (!source) return { error: "Bilan introuvable" };

    // 2. Créer le bilan "Archive" (Status Published)
    const [archive] = await db.insert(assessments).values({
      studentId: source.studentId,
      groupId: source.groupId,
      authorId: source.authorId,
      title: title, // ex: "Bulletin Trimestre 1"
      status: "published", // FIGÉ !
      lockedAt: new Date(),
    }).returning();

    // 3. COPIER TOUTES LES NOTES (La magie SQL)
    // On récupère les notes du bilan source
    const sourceGrades = await db.select().from(grades).where(eq(grades.assessmentId, sourceAssessmentId));

    if (sourceGrades.length > 0) {
      // On prépare les nouvelles lignes pour l'archive
      const gradesToInsert = sourceGrades.map(g => ({
        assessmentId: archive.id, // On lie à la nouvelle archive
        criterionId: g.criterionId,
        value: g.value,
        comment: g.comment,
      }));

      // On insère tout d'un coup
      await db.insert(grades).values(gradesToInsert);
    }

    // 4. On rafraichit (pour que l'archive apparaisse dans la liste si besoin)
    revalidatePath(`/dashboard/students/${source.studentId}`);
    
    return { success: true };
  } catch (err) {
    console.error(err);
    return { error: "Erreur lors de l'archivage" };
  }
}