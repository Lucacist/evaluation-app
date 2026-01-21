"use server";

import { db } from "@/db";
import { assessments, enrollments } from "@/db/schema";
import { decrypt } from "@/lib/session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq, and } from "drizzle-orm";

export async function createAssessmentAction(studentId: number, groupId: number) {
  // 1. Récupérer l'ID du prof connecté
  const cookie = (await cookies()).get("session")?.value;
  const session = await decrypt(cookie);
  
  if (!session?.userId) {
    throw new Error("Non autorisé");
  }

  // 2. Créer le bilan
  // On met un titre par défaut avec la date
  const date = new Date().toLocaleDateString("fr-FR", { month: 'long', year: 'numeric' });
  
  const [newAssessment] = await db.insert(assessments).values({
    studentId,
    groupId,
    authorId: session.userId as string,
    title: `Bilan - ${date}`,
    status: "draft",
  }).returning();

  // 3. Rediriger immédiatement vers la page de notation
  redirect(`/dashboard/assessments/${newAssessment.id}`);
}