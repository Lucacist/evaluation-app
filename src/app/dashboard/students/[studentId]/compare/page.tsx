import { db } from "@/db";
import { students, assessments, grades } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ComparisonDashboard } from "@/components/modules/analytics/comparison-dashboard";
import { prepareComparisonData } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";


interface PageProps {
  params: Promise<{ studentId: string }>;
}

export default async function ComparePage({ params }: PageProps) {
  const { studentId } = await params;
  const id = parseInt(studentId);

  // 1. Récupérer l'élève
  const [student] = await db.select().from(students).where(eq(students.id, id));
  if (!student) return notFound();

  // 2. Récupérer tous les bilans AVEC leurs notes
  // (On utilise db.query pour récupérer les relations imbriquées facilement)
  const allAssessments = await db.query.assessments.findMany({
    where: eq(assessments.studentId, id),
    orderBy: desc(assessments.createdAt),
    with: {
      grades: true, // Important : on veut les notes !
    }
  });

  if (allAssessments.length === 0) {
    return <div className="p-8">Pas assez de données pour comparer.</div>;
  }

  // 3. Récupérer le référentiel complet (pour avoir les noms des activités)
  const referential = await db.query.poles.findMany({
    with: { activities: { with: { blocks: { with: { criteria: true } } } } }
  });

  // 4. Préparer les données pour le graphique
  const chartData = prepareComparisonData(referential, allAssessments);

  // 5. Préparer la liste simple pour les checkboxes
  const assessmentList = allAssessments.map(a => ({
    id: a.id,
    title: a.title || "Sans titre",
    status: a.status,
    date: a.createdAt,
  })).reverse(); // On inverse pour avoir l'ordre chronologique (Bilan 1, Bilan 2...)

  return (
    <div className="space-y-6 h-[calc(100vh-100px)]">
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href={`/dashboard/students/${id}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Comparateur d'évolution</h1>
            <p className="text-muted-foreground">
              Élève : {student.lastName.toUpperCase()} {student.firstName}
            </p>
          </div>
        </div>
      </div>

      <ComparisonDashboard data={chartData} assessments={assessmentList} />
      
    </div>
  );
}