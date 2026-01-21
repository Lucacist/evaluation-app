import { db } from "./index"; // Ton instance de connexion Drizzle
import * as schema from "./schema"; // Le fichier schema.ts qu'on vient de valider
import { eq } from "drizzle-orm";

async function main() {
  console.log("🌱 Début du seeding...");

  // 1. Nettoyage (Optionnel : pour repartir propre à chaque fois)
  await db.delete(schema.grades);
  await db.delete(schema.assessments);
  await db.delete(schema.criteria);
  await db.delete(schema.competenceBlocks);
  await db.delete(schema.activities);
  await db.delete(schema.poles);
  await db.delete(schema.enrollments);
  await db.delete(schema.students);
  await db.delete(schema.groups);
  await db.delete(schema.users);

  // 2. Création Prof & Classe
  const [prof] = await db.insert(schema.users).values({
    id: "user_test_123", // ID fixe pour les tests
    name: "Professeur Principal",
    email: "prof@ecole.fr",
    role: "teacher",
  }).returning();

  const [groupe] = await db.insert(schema.groups).values({
    name: "BTS MV 1ère Année",
    schoolYear: "2024-2025",
  }).returning();

  // 3. Création Élève & Inscription
  const [eleve] = await db.insert(schema.students).values({
    firstName: "Thomas",
    lastName: "Dupont",
    email: "thomas.dupont@student.fr",
  }).returning();

  await db.insert(schema.enrollments).values({
    studentId: eleve.id,
    groupId: groupe.id,
  });

  // 4. Création de la Structure Pédagogique (Basé sur ton Excel)
  
  // Pôle 1
  const [pole1] = await db.insert(schema.poles).values({
    title: "PÔLE 1 : ENTRETIEN PÉRIODIQUE DES VÉHICULES",
    order: 1,
  }).returning();

  // Activité 1.2
  const [activite12] = await db.insert(schema.activities).values({
    poleId: pole1.id,
    title: "RÉALISATION DES CONTRÔLES DÉFINIS PAR UNE PROCÉDURE",
    code: "A1.2",
    order: 1,
  }).returning();

  // Bloc C1.2
  const [blocC12] = await db.insert(schema.competenceBlocks).values({
    activityId: activite12.id,
    title: "Réalisation des contrôles de maintenance périodique",
    code: "C1.2",
    order: 1,
  }).returning();

  // Critères (Colonnes de ton Excel)
  const criteresData = [
    "L'historique et les spécificités d'utilisation du véhicule sont pris en compte.",
    "Les contrôles à réaliser sont identifiés et hiérarchisés.",
    "Les procédures de contrôle visuels et instrumentés sont respectées.",
    "Les outils de mesure sont utilisés conformément aux exigences.",
    "Les valeurs mesurées sont comparées aux valeurs définies.",
    "Les anomalies sont identifiées.",
    "Les contrôles réalisés sont retranscrits afin d'en assurer leur traçabilité."
  ];

  const insertedCriteria = [];
  for (let i = 0; i < criteresData.length; i++) {
    const [c] = await db.insert(schema.criteria).values({
      blockId: blocC12.id,
      label: criteresData[i],
      order: i + 1,
      weight: 1,
    }).returning();
    insertedCriteria.push(c);
  }

  // 5. Simulation d'un Bilan (Déjà noté pour tester l'affichage)
  const [bilan] = await db.insert(schema.assessments).values({
    studentId: eleve.id,
    authorId: prof.id,
    groupId: groupe.id,
    title: "TP Freinage",
    status: "draft", // Encore en cours
  }).returning();

  // On met quelques notes (ex: 50, 100, 0...)
  await db.insert(schema.grades).values([
    { assessmentId: bilan.id, criterionId: insertedCriteria[0].id, value: 50 },
    { assessmentId: bilan.id, criterionId: insertedCriteria[1].id, value: 100 },
    { assessmentId: bilan.id, criterionId: insertedCriteria[2].id, value: 80 },
    // Les autres sont null (pas encore notés)
  ]);

  console.log("✅ Seeding terminé avec succès !");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });