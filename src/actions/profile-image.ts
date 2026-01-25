"use server";

import { db } from "@/db";
import { students } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateStudentProfileImageAction(
  studentId: number,
  imageBase64: string
) {
  try {
    await db
      .update(students)
      .set({ profileImage: imageBase64 })
      .where(eq(students.id, studentId));

    revalidatePath(`/dashboard/students/${studentId}`);
    revalidatePath(`/dashboard/groups/[groupId]`);
    
    return { success: true };
  } catch (e) {
    return { success: false, error: "Erreur lors de la mise à jour de l'image" };
  }
}
