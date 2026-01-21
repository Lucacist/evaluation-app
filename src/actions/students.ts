"use server";

import { db } from "@/db";
import { students, enrollments } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { eq } from "drizzle-orm";

// Schéma de validation
const createStudentSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  groupId: z.coerce.number().min(1, "ID du groupe manquant"),
});

export async function createStudentAction(prevState: any, formData: FormData) {
  // 1. Validation des données
  const data = Object.fromEntries(formData);
  const parsed = createStudentSchema.safeParse(data);

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { firstName, lastName, email, groupId } = parsed.data;

  try {
    // 2. Création de l'élève
    const [newStudent] = await db.insert(students).values({
      firstName,
      lastName,
      email: email || null, // Si vide, on met null
    }).returning();

    // 3. Inscription dans le groupe (Liaison)
    await db.insert(enrollments).values({
      studentId: newStudent.id,
      groupId: groupId,
    });

    // 4. Rafraîchir la page pour voir le nouvel élève
    revalidatePath(`/dashboard/groups/${groupId}`);
    
    return { success: true };
  } catch (err) {
    console.error(err);
    return { error: "Erreur lors de la création de l'élève." };
  }
}

const updateStudentSchema = z.object({
  studentId: z.coerce.number(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().optional().or(z.literal("")),
  groupId: z.coerce.number(), // Nouvelle classe choisie
});

export async function updateStudentAction(prevState: any, formData: FormData) {
  const data = Object.fromEntries(formData);
  const parsed = updateStudentSchema.safeParse(data);

  if (!parsed.success) return { error: "Données invalides" };

  const { studentId, firstName, lastName, email, groupId } = parsed.data;

  try {
    // 1. Mise à jour de l'identité
    await db.update(students)
      .set({ firstName, lastName, email: email || null })
      .where(eq(students.id, studentId));

    // 2. Mise à jour de la classe (Inscription)
    // NOTE : Pour simplifier ici, on supprime les anciennes inscriptions et on remet la nouvelle.
    // Dans un système complexe, on gérerait l'historique, mais là on veut "corriger" l'élève.
    await db.delete(enrollments).where(eq(enrollments.studentId, studentId));
    
    await db.insert(enrollments).values({
      studentId,
      groupId,
    });

    revalidatePath(`/dashboard/students/${studentId}`);
    return { success: true };
  } catch (err) {
    return { error: "Erreur lors de la modification." };
  }
}

// --- SUPPRESSION ---
export async function deleteStudentAction(studentId: number) {
  try {
    // Grâce au "onDelete: cascade" dans le schéma, ça devrait supprimer les notes aussi.
    // Mais par sécurité, on supprime d'abord l'inscription.
    await db.delete(enrollments).where(eq(enrollments.studentId, studentId));
    await db.delete(students).where(eq(students.id, studentId));
  } catch (err) {
    console.error(err);
    throw new Error("Impossible de supprimer l'élève");
  }
}