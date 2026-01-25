"use server";

import { db } from "@/db";
import { students, enrollments } from "@/db/schema";
import { revalidatePath } from "next/cache";

type ImportResult = {
  success: boolean;
  imported: number;
  errors: string[];
};

export async function importStudentsFromCsvAction(
  groupId: number,
  csvContent: string
): Promise<ImportResult> {
  const errors: string[] = [];
  let imported = 0;

  try {
    // Parser le CSV (séparateur: point-virgule)
    const lines = csvContent.split("\n").filter((line) => line.trim());

    if (lines.length < 2) {
      return { success: false, imported: 0, errors: ["Le fichier CSV est vide ou ne contient pas de données"] };
    }

    // Ignorer la première ligne (en-têtes)
    const dataLines = lines.slice(1);

    for (let i = 0; i < dataLines.length; i++) {
      const line = dataLines[i];
      
      // Parser la ligne CSV (gère les guillemets)
      const columns = parseCSVLine(line, ";");

      if (columns.length < 13) {
        errors.push(`Ligne ${i + 2}: Pas assez de colonnes`);
        continue;
      }

      const lastName = columns[0]?.trim().replace(/^"|"$/g, "");
      const firstName = columns[1]?.trim().replace(/^"|"$/g, "");
      const email = columns[12]?.trim().replace(/^"|"$/g, "");

      if (!lastName || !firstName) {
        errors.push(`Ligne ${i + 2}: Nom ou prénom manquant`);
        continue;
      }

      try {
        // Créer l'élève
        const [newStudent] = await db
          .insert(students)
          .values({
            firstName,
            lastName,
            email: email || null,
          })
          .returning({ id: students.id });

        // Créer l'inscription au groupe
        await db.insert(enrollments).values({
          studentId: newStudent.id,
          groupId,
        });

        imported++;
      } catch (e: any) {
        errors.push(`Ligne ${i + 2}: Erreur lors de l'import de ${lastName} ${firstName}`);
      }
    }

    revalidatePath(`/dashboard/groups/${groupId}`);

    return {
      success: imported > 0,
      imported,
      errors,
    };
  } catch (e) {
    return {
      success: false,
      imported: 0,
      errors: ["Erreur lors de la lecture du fichier CSV"],
    };
  }
}

// Fonction pour parser une ligne CSV avec gestion des guillemets
function parseCSVLine(line: string, separator: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === separator && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  // Ajouter le dernier élément
  result.push(current.trim());

  return result;
}
