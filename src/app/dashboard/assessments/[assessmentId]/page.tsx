import { db } from "@/db";
import { assessments, poles, activities, competenceBlocks, criteria, grades, students } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { AssessmentMatrix } from "@/components/modules/assessments/assessment-matrix"; // On va le créer après
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { SnapshotDialog } from "@/components/modules/assessments/snapshot-dialog";
import { getCurrentUser } from "@/lib/auth";

interface PageProps {
  params: Promise<{ assessmentId: string }>;
}

export default async function AssessmentPage({ params }: PageProps) {
  const user = await getCurrentUser();
  const isAdmin = user?.role === "admin";
  const isTeacher = user?.role === "teacher";

  const { assessmentId } = await params;
  const id = parseInt(assessmentId);
  if (isNaN(id)) return notFound();

  // 1. Récupérer les infos du Bilan + Élève
  const assessmentData = await db.query.assessments.findFirst({
    where: eq(assessments.id, id),
    with: {
      student: true,
      group: true,
    },
  });

  if (!assessmentData) return notFound();

  // 2. Récupérer TOUT le référentiel (La structure vide)
  // Grâce aux relations Drizzle, on peut tout imbriquer
  const fullReferential = await db.query.poles.findMany({
    orderBy: poles.order,
    with: {
      activities: {
        orderBy: activities.order,
        with: {
          blocks: {
            orderBy: competenceBlocks.order,
            with: {
              criteria: {
                orderBy: criteria.order,
              }
            }
          }
        }
      }
    }
  });

  // 3. Récupérer les notes existantes pour ce bilan
  const existingGrades = await db.query.grades.findMany({
    where: eq(grades.assessmentId, id),
  });

  // On transforme les notes en un objet facile à lire : { [criterionId]: value }
  const gradesMap: Record<number, number> = {};
  existingGrades.forEach((g) => {
    if (g.value !== null) gradesMap[g.criterionId] = g.value;
  });

  return (
    <div className="h-screen flex flex-col overflow-hidden">

      {/* HEADER FIXE */}
      <header className="flex items-center justify-between border-b bg-white px-6 py-3 shrink-0 z-10">
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/settings?groupId=${assessmentData.group.id}`}>
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              Activités
            </Button>
          </Link>
          <span className="text-muted-foreground">|</span>
          <Link href={`/dashboard/students/${assessmentData.studentId}`}>
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              Profil
            </Button>
          </Link>
          <div className="ml-4">
            <h1 className="text-lg font-bold flex items-center gap-2">
              {assessmentData.student.lastName} {assessmentData.student.firstName}
              <span className="text-sm font-normal text-muted-foreground bg-slate-100 px-2 py-0.5 rounded-full">
                {assessmentData.status === "draft" ? "Brouillon" : "Verrouillé"}
              </span>
            </h1>
            <p className="text-xs text-muted-foreground">
              {assessmentData.title} • {assessmentData.group.name}
            </p>
          </div>
        </div>

        <div className="flex gap-2 items-center">
          {isAdmin ? (
            <div className="flex items-center gap-2 px-3 py-1 bg-red-50 text-red-700 text-xs font-bold rounded-full border border-red-200">
              <ShieldAlert className="h-3 w-3" /> MODE ADMIN
            </div>
          ) : (
            <div className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
              Mode Prof (Lecture seule)
            </div>
          )}
          {(isAdmin || isTeacher) && assessmentData.status === "draft" && (
            <SnapshotDialog assessmentId={id} />
          )}
          <Button variant="ghost" disabled className="text-muted-foreground text-xs">
            Sauvegardé auto.
          </Button>
        </div>      

      </header>

      {/* CONTENU PRINCIPAL SCROLLABLE */}
      <main className="flex-1 overflow-auto bg-slate-50 p-6">
        <div className="max-w-5xl mx-auto space-y-8">

          {/* C'est ici qu'on va injecter le gros composant matrice */}
          <AssessmentMatrix
            assessmentId={id}
            referential={fullReferential}
            initialGrades={gradesMap}
            readOnly={assessmentData.status === "published"}
          />

        </div>
      </main>
    </div>
  );
}