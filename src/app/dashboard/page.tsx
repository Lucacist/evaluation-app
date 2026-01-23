import { db } from "@/db";
import { groups, referentials } from "@/db/schema";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Trash2, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { GroupDialog } from "@/components/modules/groups/group-dialog";
import { getCurrentUser } from "@/lib/auth";


// Petit composant pour le bouton supprimer (Client Component inline)
import { DeleteGroupButton } from "./delete-group-button";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  const isAdmin = user?.role === "admin";
  const classes = await db.select().from(groups);
  const allRefs = await db.select().from(referentials);

  return (
    <div className="space-y-6">

      {/* EN-TÊTE AVEC BOUTON AJOUTER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
          <p className="text-muted-foreground">Sélectionnez une classe pour voir les élèves.</p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin ? (
            <div className="flex items-center gap-2 px-3 py-1 bg-red-50 text-red-700 text-xs font-bold rounded-full border border-red-200">
              <ShieldAlert className="h-3 w-3" /> MODE ADMIN
            </div>
          ) : (
            <div className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
              Mode Prof (Lecture seule)
            </div>
          )}
          {isAdmin && (
            <GroupDialog mode="create" referentials={allRefs} />
          )}
        </div>
      </div>

      {/* LISTE DES CLASSES */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {classes.map((group) => (
          <Card key={group.id} className="hover:shadow-md transition-shadow relative group">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">

                {/* TITRE + LIEN ÉTENDU */}
                <CardTitle className="flex items-center gap-2 text-xl text-foreground">
                  <Users className="h-5 w-5 text-muted-foreground" />

                  {/* Ce Link contient un span vide qui recouvre toute la carte */}
                  <Link href={`/dashboard/groups/${group.id}`}>
                    {/* Le span ci-dessous étend la zone de clic à tout le parent 'relative' (la Card) */}
                    <span className="absolute inset-0" aria-hidden="true" />
                    {group.name}
                  </Link>
                </CardTitle>

                {/* ACTIONS (EDIT / DELETE) */}
                {/* IMPORTANT : 'relative z-10' permet aux boutons de rester cliquables au-dessus du lien global */}
                {isAdmin && (
                  <div className="flex items-center gap-1 relative z-10">
                    <GroupDialog mode="edit" referentials={allRefs} group={group} />
                    <DeleteGroupButton id={group.id} />
                  </div>
                )}
              </div>
              <CardDescription>{group.schoolYear}</CardDescription>
            </CardHeader>

            <CardContent>
              <Link href={`/dashboard/groups/${group.id}`}>
                <div className="text-sm text-muted-foreground mt-2 cursor-pointer">
                  Cliquez pour gérer les élèves
                </div>
              </Link>
            </CardContent>
          </Card>
        ))}

        {classes.length === 0 && (
          <div className="col-span-full text-center py-12 border-2 border-dashed rounded-lg text-muted-foreground">
            Aucune classe pour le moment. Créez-en une nouvelle !
          </div>
        )}
      </div>
    </div>
  );
}