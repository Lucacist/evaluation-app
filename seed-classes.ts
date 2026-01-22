import { db } from "@/db";
import { groups, students, enrollments, referentials } from "@/db/schema";
import { eq } from "drizzle-orm";

const studentsData = [
  { firstName: "Elise", lastName: "BOURGEOIS" },
  { firstName: "Kris", lastName: "CHAUDIERE" },
  { firstName: "Noan", lastName: "GUICHAUX" },
  { firstName: "Leo", lastName: "LAVEILLE" },
  { firstName: "Gautier", lastName: "LE BRETON" },
  { firstName: "Tom", lastName: "LEROUX" },
  { firstName: "Raphael", lastName: "MAHERZAKI" },
  { firstName: "Pierre", lastName: "PAPOIN" },
  { firstName: "Gabriel", lastName: "PETITON" },
  { firstName: "Evan", lastName: "TURQUER" },
  { firstName: "Candice", lastName: "VADET" },
];

async function main() {
  console.log("🌱 Création des classes et élèves...");

  // 1. Récupérer le référentiel BTS créé juste avant
  // On cherche celui qui contient "BTS" dans le nom
  const btsRef = await db.query.referentials.findFirst({
    where: (ref, { like }) => like(ref.name, "%BTS%")
  });

  if (!btsRef) {
    console.error("❌ Erreur : Aucun référentiel 'BTS' trouvé. Lance d'abord 'npm run seed-referential.ts'");
    process.exit(1);
  }

  // 2. Créer la Classe (Groupe)
  const [newGroup] = await db.insert(groups).values({
    name: "BTS MV 1ère Année",
    schoolYear: "2025-2026",
    referentialId: btsRef.id // <--- On lie la classe au référentiel BTS
  }).returning();

  console.log(`✅ Classe créée : ${newGroup.name} (Liée au référentiel : ${btsRef.name})`);

  // 3. Créer les Élèves et les Inscrire
  for (const s of studentsData) {
    // Créer l'élève
    const [newStudent] = await db.insert(students).values({
      firstName: s.firstName,
      lastName: s.lastName,
      email: `${s.firstName.toLowerCase()}.${s.lastName.toLowerCase()}@ecole.fr`
    }).returning();

    // L'inscrire dans la classe
    await db.insert(enrollments).values({
      studentId: newStudent.id,
      groupId: newGroup.id
    });
  }

  console.log(`✅ ${studentsData.length} élèves ajoutés !`);
  process.exit(0);
}

main();