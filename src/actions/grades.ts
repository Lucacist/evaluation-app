"use server";

import { db } from "@/db";
import { grades, assessments } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Sauvegarde ou met à jour une note
export async function saveGradeAction(assessmentId: number, criterionId: number, value: number) {
  try {
    // 1. Vérifier si le bilan est verrouillé (Sécurité)
    const [assessment] = await db
      .select({ status: assessments.status })
      .from(assessments)
      .where(eq(assessments.id, assessmentId));

    if (assessment?.status === "published") {
      return { error: "Ce bilan est verrouillé." };
    }

    // 2. Vérifier si une note existe déjà pour ce critère
    const [existingGrade] = await db
      .select()
      .from(grades)
      .where(
        and(
          eq(grades.assessmentId, assessmentId),
          eq(grades.criterionId, criterionId)
        )
      );

    if (existingGrade) {
      // UPDATE
      await db
        .update(grades)
        .set({ value })
        .where(eq(grades.id, existingGrade.id));
    } else {
      // INSERT
      await db.insert(grades).values({
        assessmentId,
        criterionId,
        value,
      });
    }

    // Pas besoin de revalidatePath ici car on mettra à jour l'état localement (Optimistic UI)
    // pour que ce soit instantané.
    return { success: true };
  } catch (err) {
    console.error(err);
    return { error: "Erreur de sauvegarde" };
  }
}