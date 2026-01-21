import { db } from "@/db";
import { students, enrollments, groups } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, User, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AddStudentDialog } from "@/components/modules/students/add-student-dialog";

// Cette interface définit les paramètres de l'URL (ex: groupId = "1")
interface PageProps {
  params: Promise<{ groupId: string }>;
}

export default async function GroupPage({ params }: PageProps) {
  // Dans Next.js 15+, params est une Promise, il faut l'await
  const { groupId } = await params;
  const groupIdInt = parseInt(groupId);

  if (isNaN(groupIdInt)) return notFound();

  // 1. Récupérer les infos du groupe (pour le titre)
  const [group] = await db
    .select()
    .from(groups)
    .where(eq(groups.id, groupIdInt))
    .limit(1);

  if (!group) return notFound();

  // 2. Récupérer les élèves du groupe via la table de liaison (enrollments)
  const groupStudents = await db
    .select({
      id: students.id,
      firstName: students.firstName,
      lastName: students.lastName,
      email: students.email,
      joinedAt: enrollments.joinedAt,
    })
    .from(students)
    .innerJoin(enrollments, eq(students.id, enrollments.studentId))
    .where(eq(enrollments.groupId, groupIdInt));

  return (
    <div className="space-y-6">
      
      {/* En-tête de page avec bouton retour */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
            <Link href="/dashboard" className="hover:text-primary flex items-center gap-1">
              <ArrowLeft className="h-3 w-3" /> Retour
            </Link>
            <span>/</span>
            <span>{group.name}</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{group.name}</h1>
          <p className="text-muted-foreground">
            Liste des élèves inscrits pour l'année {group.schoolYear}
          </p>
        </div>
        
        <AddStudentDialog groupId={groupIdInt} />
      </div>

      {/* Tableau des élèves */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>Prénom</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groupStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Aucun élève dans ce groupe pour le moment.
                </TableCell>
              </TableRow>
            ) : (
              groupStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                      <User className="h-4 w-4 text-slate-500" />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{student.lastName.toUpperCase()}</TableCell>
                  <TableCell>{student.firstName}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{student.email || "-"}</TableCell>
                  <TableCell className="text-right">
                    <Link href={`/dashboard/students/${student.id}`}>
                      <Button variant="outline" size="sm">
                        Voir Profil
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}