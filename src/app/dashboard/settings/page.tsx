import { db } from "@/db";
import { groups, students, enrollments, vehicles, tps } from "@/db/schema";
import { eq, asc, and } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import Link from "next/link";
import { SessionManager } from "@/components/modules/workshop/session-manager";

type Props = {
  searchParams: Promise<{ groupId?: string }>;
};

export default async function WorkshopPage({ searchParams }: Props) {
  const params = await searchParams;
  const groupId = params.groupId ? parseInt(params.groupId) : null;

  // 1. Charger tous les groupes
  const allGroups = await db.select().from(groups);

  // 2. Si un groupe est sélectionné, charger ses données
  let groupData = null;
  let groupStudents: any[] = [];
  let allVehicles: any[] = [];
  let allTps: any[] = [];

  if (groupId) {
    // Info groupe
    const g = allGroups.find(g => g.id === groupId);
    groupData = g;

    if (g) {
      // Élèves + Ce qu'ils font actuellement (TP/Véhicule)
      // On utilise une requête relationnelle pour récupérer les élèves du groupe
      groupStudents = await db.query.students.findMany({
        with: {
          enrollments: true,
          currentTp: true,
          currentVehicle: true,
        },
        where: (students, { exists, eq, and }) => exists(
          db.select().from(enrollments).where(
            and(
              eq(enrollments.studentId, students.id),
              eq(enrollments.groupId, groupId)
            )
          )
        ),
        orderBy: asc(students.lastName),
      });

      // Listes déroulantes
      allVehicles = await db.select().from(vehicles).orderBy(vehicles.name);
      allTps = await db.select().from(tps).orderBy(tps.category, tps.title);
    }
  }

  return (
    <div className="space-y-6">
      
      {/* TITRE */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestion d'Atelier</h1>
        <p className="text-muted-foreground">Affectation des TPs et Véhicules par séance.</p>
      </div>

      {/* SÉLECTION DU GROUPE */}
      {!groupId ? (
        <div className="grid gap-4 md:grid-cols-3">
          {allGroups.map((g) => (
            <Link key={g.id} href={`/dashboard/settings?groupId=${g.id}`}>
              <Card className="hover:bg-slate-50 transition-colors cursor-pointer border-l-4 border-l-primary">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    {g.name}
                  </CardTitle>
                  <CardDescription>{g.schoolYear}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* HEADER GROUPE AVEC RETOUR */}
          <div className="flex items-center gap-4">
            <Link href="/dashboard/settings">
              <Button variant="outline">← Changer de classe</Button>
            </Link>
            <h2 className="text-2xl font-bold text-primary">{groupData?.name} - Gestion de Séance</h2>
          </div>

          {/* LE GESTIONNAIRE */}
          <SessionManager 
            students={groupStudents} 
            vehicles={allVehicles} 
            tps={allTps} 
            groupId={groupId} 
          />

        </div>
      )}
    </div>
  );
}