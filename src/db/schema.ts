import { pgTable, serial, text, integer, timestamp, boolean, primaryKey, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// --- ENUMS ---
export const assessmentStatusEnum = pgEnum("assessment_status", ["draft", "published"]);

// ==========================================
// 1. UTILISATEURS & CLASSES
// ==========================================

export const users = pgTable("users", {
  id: text("id").primaryKey(), // String ID (often UUID) for auth users
  name: text("name"),
  email: text("email").notNull().unique(),
  password: text("password"), // Hashed
  role: text("role").default("teacher"), // Simplified to text: 'teacher', 'admin', etc.
  createdAt: timestamp("created_at").defaultNow(),
});

// 1. NOUVELLE TABLE : LES RÉFÉRENTIELS
export const referentials = pgTable("referentials", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // ex: "BTS MV Option A"
});

export const groups = pgTable("groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  schoolYear: text("school_year").notNull(),
  referentialId: integer("referential_id").references(() => referentials.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// ==========================================
// 2. RÉFÉRENTIEL (STRUCTURE PÉDAGOGIQUE)
// ==========================================

export const poles = pgTable("poles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  order: integer("order").notNull(),
  // AJOUT : Lien vers le référentiel
  referentialId: integer("referential_id").references(() => referentials.id, { onDelete: 'cascade' }),
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
  label: text("label").notNull(), // The skill text to grade
  weight: integer("weight").default(1).notNull(), // Weighting
  order: integer("order").notNull(),
});

// ==========================================
// 3. ATELIER (TPS & VÉHICULES)
// ==========================================

// 1. LES TPs (Fixed list: TP Bas Moteur, Distribution, etc.)
export const tps = pgTable("tps", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").default("General"), // ex: Moteur, Freinage...
  color: text("color").default("bg-slate-100"), // For display tags
});

// 2. LES VÉHICULES (Fixed list: 207 Grise, C3 Pluriel...)
export const vehicles = pgTable("vehicles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  plate: text("plate"), // Optional plate number
  status: text("status").default("available"), // available, maintenance...
});

export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow(),
  // Workshop assignment fields
  currentTpId: integer("current_tp_id").references(() => tps.id),
  currentVehicleId: integer("current_vehicle_id").references(() => vehicles.id),
});

// Enrollment (Student <-> Group)
export const enrollments = pgTable("enrollments", {
  studentId: integer("student_id").references(() => students.id).notNull(),
  groupId: integer("group_id").references(() => groups.id).notNull(),
  joinedAt: timestamp("joined_at").defaultNow(),
}, (t) => ({
  pk: primaryKey({ columns: [t.studentId, t.groupId] }), // Composite Key
}));

// 4. HISTORIQUE DES TPs RÉALISÉS
export const studentTps = pgTable("student_tps", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
  tpId: integer("tp_id").notNull().references(() => tps.id),
  assignedAt: timestamp("assigned_at").defaultNow(),
});

// ==========================================
// 4. ÉVALUATIONS & NOTES
// ==========================================

// Assessment = A "Report" (ex: "Bilan Trimestre 1")
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
  
  value: integer("value"), // 0, 10, 20... 100. NULL if not graded.
  comment: text("comment"),
});

// ==========================================
// 5. RELATIONS (DRIZZLE QUERY HELPERS)
// ==========================================

export const studentsRelations = relations(students, ({ one, many }) => ({
  enrollments: many(enrollments),
  // Workshop Relations
  currentTp: one(tps, { fields: [students.currentTpId], references: [tps.id] }),
  currentVehicle: one(vehicles, { fields: [students.currentVehicleId], references: [vehicles.id] }),
  history: many(studentTps),
  assessments: many(assessments),
}));

export const tpsRelations = relations(tps, ({ many }) => ({
  currentStudents: many(students),
  history: many(studentTps),
}));

export const vehiclesRelations = relations(vehicles, ({ many }) => ({
  currentStudents: many(students),
}));

export const groupsRelations = relations(groups, ({ many, one }) => ({ // <--- Ajout de "one" ici
  enrollments: many(enrollments),
  assessments: many(assessments),
  referential: one(referentials, { fields: [groups.referentialId], references: [referentials.id] }),
}));

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  student: one(students, { fields: [enrollments.studentId], references: [students.id] }),
  group: one(groups, { fields: [enrollments.groupId], references: [groups.id] }),
}));

export const polesRelations = relations(poles, ({ many, one }) => ({ // <--- Ajout de "one" ici
  activities: many(activities),
  referential: one(referentials, { fields: [poles.referentialId], references: [referentials.id] }),
}));

export const activitiesRelations = relations(activities, ({ one, many }) => ({
  pole: one(poles, { fields: [activities.poleId], references: [poles.id] }),
  blocks: many(competenceBlocks),
}));

export const referentialsRelations = relations(referentials, ({ many }) => ({
  poles: many(poles),
  groups: many(groups),
}));

export const blocksRelations = relations(competenceBlocks, ({ one, many }) => ({
  activity: one(activities, { fields: [competenceBlocks.activityId], references: [activities.id] }),
  criteria: many(criteria),
}));

export const criteriaRelations = relations(criteria, ({ one, many }) => ({
  block: one(competenceBlocks, { fields: [criteria.blockId], references: [competenceBlocks.id] }),
  grades: many(grades),
}));

export const assessmentsRelations = relations(assessments, ({ one, many }) => ({
  student: one(students, { fields: [assessments.studentId], references: [students.id] }),
  group: one(groups, { fields: [assessments.groupId], references: [groups.id] }), 
  author: one(users, { fields: [assessments.authorId], references: [users.id] }),
  grades: many(grades),
}));

export const gradesRelations = relations(grades, ({ one }) => ({
  assessment: one(assessments, { fields: [grades.assessmentId], references: [assessments.id] }),
  criterion: one(criteria, { fields: [grades.criterionId], references: [criteria.id] }),
}));