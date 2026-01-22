import { db } from "@/db";
import { groups, referentials } from "@/db/schema";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Trash2 } from "lucide-react";
import Link from "next/link";
import { GroupDialog } from "@/components/modules/groups/group-dialog";
import { deleteGroupAction } from "@/actions/settings";
import { redirect } from "next/navigation";

// Petit composant pour le bouton supprimer (Client Component inline)
import { DeleteGroupButton } from "./delete-group-button";

export default async function DashboardPage() {
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
        <GroupDialog mode="create" referentials={allRefs} />
      </div>

      {/* LISTE DES CLASSES */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {classes.map((group) => (
          <Card key={group.id} className="hover:shadow-md transition-shadow relative group">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <Link href={`/dashboard/groups/${group.id}`} className="flex-1">
                  <CardTitle className="flex items-center gap-2 text-xl hover:text-primary transition-colors cursor-pointer">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    {group.name}
                  </CardTitle>
                </Link>

                {/* ACTIONS (EDIT / DELETE) */}
                <div className="flex items-center gap-1">
                  <GroupDialog mode="edit" referentials={allRefs} group={group} />
                  <DeleteGroupButton id={group.id} />
                </div>
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