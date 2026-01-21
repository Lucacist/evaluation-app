import { db } from "@/db";
import { students, groups, enrollments, assessments } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, User, GraduationCap, Calendar, ChevronRight, Play } from "lucide-react";
import Link from "next/link";
import { EditStudentDialog } from "@/components/modules/students/edit-student-dialog";
import { DeleteStudentAlert } from "@/components/modules/students/delete-student-alert";
import { OpenActiveAssessmentButton } from "@/components/modules/assessments/open-active-assessment-button";
import { poles, activities, competenceBlocks, criteria, grades } from "@/db/schema";
import { CompetenceRadar } from "@/components/modules/analytics/competence-radar";
import { computePoleAverages } from "@/lib/analytics";
import { LineChart as ChartIcon } from "lucide-react";

interface PageProps {
  params: Promise<{ studentId: string }>;
}

export default async function StudentProfilePage({ params }: PageProps) {
  const { studentId } = await params;
  const id = parseInt(studentId);
  if (isNaN(id)) return notFound();

  // 1. Infos Élève & Groupe
  const studentData = await db
    .select({ student: students, group: groups })
    .from(students)
    .innerJoin(enrollments, eq(students.id, enrollments.studentId))
    .innerJoin(groups, eq(enrollments.groupId, groups.id))
    .where(eq(students.id, id))
    .limit(1);

  if (studentData.length === 0) return notFound();
  const { student, group } = studentData[0];

  const allGroups = await db.select().from(groups);

  // 2. LOGIQUE CLÉ : On sépare la fiche active des archives
  const allAssessments = await db
    .select()
    .from(assessments)
    .where(eq(assessments.studentId, id))
    .orderBy(desc(assessments.createdAt));

  // On cherche s'il y a déjà une fiche "draft" (Active)
  const activeAssessment = allAssessments.find(a => a.status === "draft");

  // Les autres sont des archives
  const archives = allAssessments.filter(a => a.status === "published");

  // 4. RÉCUPÉRATION DONNÉES POUR GRAPHIQUE
  const referential = await db.query.poles.findMany({
    with: { activities: { with: { blocks: { with: { criteria: true } } } } }
  });

  let chartData: any[] = [];

  if (activeAssessment) {
    const activeGradesRaw = await db
      .select()
      .from(grades)
      .where(eq(grades.assessmentId, activeAssessment.id));

    const gradesMap: Record<number, number> = {};
    activeGradesRaw.forEach(g => { if (g.value !== null) gradesMap[g.criterionId] = g.value });

    chartData = computePoleAverages(referential, gradesMap);
  }

  return (
    <div className="space-y-6">

      {/* Header / Retour */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href={`/dashboard/groups/${group.id}`} className="hover:text-primary flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" />
          Retour à la classe {group.name}
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">

        {/* COLONNE GAUCHE : Identité */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <User className="h-6 w-6 text-primary" />
              {student.lastName.toUpperCase()} {student.firstName}
            </CardTitle>
            <CardDescription>Fiche d'identité</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-md">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{student.email || "Aucun email"}</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-md">
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{group.name}</span>
            </div>
            <div className="flex gap-2 pt-4 border-t mt-4">
              <EditStudentDialog student={student} currentGroupId={group.id} allGroups={allGroups} />
              <DeleteStudentAlert studentId={student.id} groupId={group.id} />
            </div>
          </CardContent>
        </Card>

        {/* COLONNE DROITE : SUIVI & ARCHIVES */}
        <div className="space-y-6">

          {/* BOUTON D'ACCÈS RAPIDE */}
          <Card className="border-primary/20 bg-blue-50/50 dark:bg-blue-950/10">
            <CardHeader>
              <CardTitle className="text-primary">Suivi en cours</CardTitle>
              <CardDescription>Accéder à la grille de notation actuelle (continue)</CardDescription>
            </CardHeader>
            <CardContent>
              <OpenActiveAssessmentButton
                studentId={student.id}
                groupId={group.id}
                existingAssessmentId={activeAssessment?.id}
              />
            </CardContent>
          </Card>

          {/* GRAPHIQUE */}
          {activeAssessment ? (
            <CompetenceRadar data={chartData} />
          ) : (
            <Card><CardContent className="pt-6 text-center text-muted-foreground">Pas encore de données pour le graphique</CardContent></Card>
          )}

          <div className="flex justify-end mb-2">
            <Link href={`/dashboard/students/${student.id}/compare`}>
              <Button variant="outline" className="gap-2">
                <ChartIcon className="h-4 w-4" />
                Voir l'évolution détaillée (Comparateur)
              </Button>
            </Link>
          </div>

          {/* LISTE DES ARCHIVES (Trimestres passés) */}
          {/* Note : J'ai retiré le </div> qui était ici, pour que Archives soit dans la même colonne */}
          <Card>
            <CardHeader>
              <CardTitle>Archives & Bulletins</CardTitle>
              <CardDescription>Historique des arrêts de notes</CardDescription>
            </CardHeader>
            <CardContent>
              {archives.length === 0 ? (
                <p className="text-muted-foreground text-sm py-2">Aucune archive pour le moment.</p>
              ) : (
                <div className="space-y-2">
                  {archives.map((arch) => (
                    <Link
                      key={arch.id}
                      href={`/dashboard/assessments/${arch.id}`}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{arch.title}</span>
                        <span className="text-xs text-muted-foreground">
                          Arrêté le {arch.lockedAt ? new Date(arch.lockedAt).toLocaleDateString() : "-"}
                        </span>
                      </div>
                      <Badge variant="secondary">Figé</Badge>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

        </div> {/* Fermeture de la colonne droite */}

      </div> {/* Fermeture de la grille */}
    </div>
  );
}