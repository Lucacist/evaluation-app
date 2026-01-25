import { db } from "@/db";
import { students, groups, enrollments, assessments, grades, poles, activities, competenceBlocks, criteria, studentTps, tps } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, User, GraduationCap, Calendar, ChevronRight, Play, Wrench, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { EditStudentDialog } from "@/components/modules/students/edit-student-dialog";
import { DeleteStudentAlert } from "@/components/modules/students/delete-student-alert";
import { OpenActiveAssessmentButton } from "@/components/modules/assessments/open-active-assessment-button";
import { CompetenceRadar } from "@/components/modules/analytics/competence-radar";
import { computePoleAverages } from "@/lib/analytics";
import { LineChart as ChartIcon } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { AddHistoryDialog } from "@/components/modules/students/history/add-history-dialog";
import { DeleteHistoryButton } from "@/components/modules/students/history/delete-history-button";
import { getCurrentUser } from "@/lib/auth";

interface PageProps {
  params: Promise<{ studentId: string }>; // Note: Next.js utilise souvent 'id' ou 'studentId' selon le nom du dossier
}

export default async function StudentProfilePage({ params }: PageProps) {
  const user = await getCurrentUser();
  const isAdmin = user?.role === "admin";

  // Adaptation : si ton dossier s'appelle [id], utilise .id, sinon .studentId
  const resolvedParams = await params;
  const idStr = (resolvedParams as any).id || resolvedParams.studentId;
  const id = parseInt(idStr);

  if (isNaN(id)) return notFound();

  // 1. Infos Élève & Groupe
  const studentData = await db
    .select({ student: students, group: groups })
    .from(students)
    .innerJoin(enrollments, eq(students.id, enrollments.studentId))
    .innerJoin(groups, eq(enrollments.groupId, groups.id))
    .where(eq(students.id, id))
    .limit(1);

  const allTpsList = await db.select().from(tps).orderBy(tps.category, tps.title);

  if (studentData.length === 0) return notFound();
  const { student, group } = studentData[0];

  const allGroups = await db.select().from(groups);

  const allAssessments = await db
    .select()
    .from(assessments)
    .where(eq(assessments.studentId, id))
    .orderBy(desc(assessments.createdAt));

  const activeAssessment = allAssessments.find(a => a.status === "draft");

  const archives = allAssessments.filter(a => a.status === "published");

  // 3. RÉCUPÉRATION DONNÉES POUR GRAPHIQUE
  // (J'ajoute le filtre referentialId pour sécuriser le graphique)
  const referential = await db.query.poles.findMany({
    where: group.referentialId ? eq(poles.referentialId, group.referentialId) : undefined,
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

  // 4. RÉCUPÉRATION HISTORIQUE ATELIER (TPs) -- AJOUT ICI
  const tpHistory = await db.select({
    id: studentTps.id,
    date: studentTps.assignedAt,
    tpTitle: tps.title,
    category: tps.category,
    color: tps.color
  })
    .from(studentTps)
    .leftJoin(tps, eq(studentTps.tpId, tps.id))
    .where(eq(studentTps.studentId, id))
    .orderBy(desc(studentTps.assignedAt));

  return (
    <div className="space-y-6 pb-10">

      {/* Header / Retour */}
      <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
        <Link href={`/dashboard/groups/${group.id}`} className="hover:text-primary flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" />
          Retour à la classe {group.name}
        </Link>
        {isAdmin ? (
          <div className="flex items-center gap-2 px-3 py-1 bg-red-50 text-red-700 text-xs font-bold rounded-full border border-red-200">
            <ShieldAlert className="h-3 w-3" /> MODE ADMIN
          </div>
        ) : (
          <div className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
            Mode Prof (Lecture seule)
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">

        {/* COLONNE GAUCHE : Identité */}
        <div className="space-y-6">
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
              {isAdmin && (
                <div className="flex gap-2 pt-4 border-t mt-4">
                  <EditStudentDialog student={student} currentGroupId={group.id} allGroups={allGroups} />
                  <DeleteStudentAlert studentId={student.id} groupId={group.id} />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

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

      {/* --- NOUVELLE SECTION : HISTORIQUE ATELIER (Bas de page) --- */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1.5">
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-slate-500" />
              Historique Atelier
            </CardTitle>
            <CardDescription>
              Liste des TPs réalisés et enregistrés.
            </CardDescription>
          </div>
          {isAdmin && (
            <AddHistoryDialog studentId={student.id} allTps={allTpsList} />
          )}
        </CardHeader>

        <CardContent>
          {tpHistory.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground italic">
              Aucun TP enregistré pour le moment.
            </div>
          ) : (
            <div className="rounded-md border">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Catégorie</th>
                    <th className="px-4 py-3 font-medium">TP</th>
                    {isAdmin && <th className="px-4 py-3 w-[50px]"></th>}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {tpHistory.map((h) => (
                    <tr key={h.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-4 py-3 text-slate-600">
                        {h.date ? format(h.date, "dd MMM yyyy", { locale: fr }) : "-"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="font-normal bg-slate-50">
                          {h.category}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 font-medium">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${h.color || "bg-gray-400"}`}></div>
                          {h.tpTitle}
                        </div>
                      </td>
                      {/* BOUTON SUPPRIMER (AJOUT ICI) */}
                      {isAdmin && (
                        <td className="px-4 py-3 text-right">
                          <DeleteHistoryButton id={h.id} studentId={id} />
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}