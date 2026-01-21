import { pgTable, serial, text, integer, timestamp, pgEnum, primaryKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// --- ENUMS ---
// Pour gérer le statut du bilan (Brouillon vs Figé)
export const assessmentStatusEnum = pgEnum("assessment_status", ["draft", "published"]);

// ==========================================
// 1. UTILISATEURS & CLASSES
// ==========================================

export const users = pgTable("users", {
  id: text("id").primaryKey(), // On utilise souvent un String (UUID) pour les users auth
  name: text("name"),
  email: text("email").notNull().unique(),
  password: text("password"), // Hashed
  role: text("role").default("teacher"), // teacher, admin...
  createdAt: timestamp("created_at").defaultNow(),
});

export const groups = pgTable("groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // ex: "BTS MV 1"
  schoolYear: text("school_year").notNull(), // ex: "2023-2024"
  createdAt: timestamp("created_at").defaultNow(),
});

export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  // PLUS DE GROUP_ID ICI ! L'élève est indépendant.
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email"), // Utile si l'élève doit recevoir son bilan plus tard
  createdAt: timestamp("created_at").defaultNow(),
});

export const enrollments = pgTable("enrollments", {
  studentId: integer("student_id").references(() => students.id).notNull(),
  groupId: integer("group_id").references(() => groups.id).notNull(),
  joinedAt: timestamp("joined_at").defaultNow(),
}, (t) => ({
  pk: primaryKey({ columns: [t.studentId, t.groupId] }), // Clé composite
}));

// ==========================================
// 2. RÉFÉRENTIEL (STRUCTURE PÉDAGOGIQUE)
// ==========================================

export const poles = pgTable("poles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(), // ex: "PÔLE 1 : ENTRETIEN..."
  order: integer("order").notNull(), // Pour gérer l'ordre d'affichage
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  poleId: integer("pole_id").references(() => poles.id, { onDelete: 'cascade' }).notNull(),
  title: text("title").notNull(),
  code: text("code"), // ex: "A1.2"
  order: integer("order").notNull(),
});

export const competenceBlocks = pgTable("competence_blocks", {
  id: serial("id").primaryKey(),
  activityId: integer("activity_id").references(() => activities.id, { onDelete: 'cascade' }).notNull(),
  title: text("title").notNull(), // ex: "Réalisation des contrôles..."
  code: text("code"), // ex: "C1.2"
  order: integer("order").notNull(),
});

export const criteria = pgTable("criteria", {
  id: serial("id").primaryKey(),
  blockId: integer("block_id").references(() => competenceBlocks.id, { onDelete: 'cascade' }).notNull(),
  label: text("label").notNull(), // Le texte de la compétence à noter
  weight: integer("weight").default(1).notNull(), // Pondération
  order: integer("order").notNull(),
});

// ==========================================
// 3. ÉVALUATIONS & NOTES
// ==========================================

// Assessment = Un "Bilan" (ex: "Bilan Trimestre 1")
export const assessments = pgTable("assessments", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => students.id).notNull(),
  authorId: text("author_id").references(() => users.id).notNull(),
  
  groupId: integer("group_id").references(() => groups.id).notNull(),
  
  title: text("title"),
  status: assessmentStatusEnum("status").default("draft").notNull(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
  lockedAt: timestamp("locked_at"),
});

export const grades = pgTable("grades", {
  id: serial("id").primaryKey(),
  assessmentId: integer("assessment_id").references(() => assessments.id, { onDelete: 'cascade' }).notNull(),
  criterionId: integer("criterion_id").references(() => criteria.id).notNull(),
  
  value: integer("value"), // 0, 10, 20... 100. NULL si non évalué.
  comment: text("comment"),
});

// ==========================================
// 4. RELATIONS (POUR DRIZZLE QUERIES)
// ==========================================

export const groupsRelations = relations(groups, ({ many }) => ({
  enrollments: many(enrollments),
  assessments: many(assessments),
}));

export const studentsRelations = relations(students, ({ many }) => ({
  enrollments: many(enrollments), // Un élève a plusieurs inscriptions (années)
  assessments: many(assessments),
}));

export const polesRelations = relations(poles, ({ many }) => ({
  activities: many(activities),
}));

export const activitiesRelations = relations(activities, ({ one, many }) => ({
  pole: one(poles, { fields: [activities.poleId], references: [poles.id] }),
  blocks: many(competenceBlocks),
}));

export const blocksRelations = relations(competenceBlocks, ({ one, many }) => ({
  activity: one(activities, { fields: [competenceBlocks.activityId], references: [activities.id] }),
  criteria: many(criteria),
}));

export const criteriaRelations = relations(criteria, ({ one, many }) => ({
  block: one(competenceBlocks, { fields: [criteria.blockId], references: [competenceBlocks.id] }),
  grades: many(grades),
}));

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  student: one(students, { fields: [enrollments.studentId], references: [students.id] }),
  group: one(groups, { fields: [enrollments.groupId], references: [groups.id] }),
}));

export const assessmentsRelations = relations(assessments, ({ one, many }) => ({
  student: one(students, { fields: [assessments.studentId], references: [students.id] }),
  group: one(groups, { fields: [assessments.groupId], references: [groups.id] }), // Lien Bilan -> Groupe
  author: one(users, { fields: [assessments.authorId], references: [users.id] }),
  grades: many(grades),
}));

export const gradesRelations = relations(grades, ({ one }) => ({
  assessment: one(assessments, { fields: [grades.assessmentId], references: [assessments.id] }),
  criterion: one(criteria, { fields: [grades.criterionId], references: [criteria.id] }),
}));