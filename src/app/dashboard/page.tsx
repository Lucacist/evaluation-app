import { db } from "@/db";
import { groups, referentials } from "@/db/schema";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { GroupDialog } from "@/components/modules/groups/group-dialog";
import { getCurrentUser } from "@/lib/auth";
import { asc } from "drizzle-orm";

// Petit composant pour le bouton supprimer (Client Component inline)
import { DeleteGroupButton } from "./delete-group-button";
import { MoveGroupButtons } from "@/components/modules/groups/move-group-buttons";

// DÉFINITION DES COULEURS (Mapping Nom -> Classe Tailwind)
const COLOR_MAP: Record<string, string> = {
  blue: "border-l-blue-500",
  green: "border-l-emerald-500",
  purple: "border-l-violet-500",
  red: "border-l-rose-500",
  orange: "border-l-amber-500",
  slate: "border-l-slate-500",
};

export default async function DashboardPage() {
  const user = await getCurrentUser();

  const isAdmin = user?.role === "admin";
  const classes = await db.select().from(groups).orderBy(asc(groups.position));
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
        {classes.map((group, index) => {
          // 2. CALCUL DE LA COULEUR
          // On récupère la classe CSS correspondant à la couleur stockée (ou bleu par défaut)
          // Note: TypeScript peut râler si 'color' n'est pas encore dans tes types générés, 
          // tu peux ajouter "as any" temporairement : (group as any).color
          const borderClass = COLOR_MAP[group.color as string] || "border-l-blue-500";
          const isFirst = index === 0;
          const isLast = index === classes.length - 1;

          return (
            <Card
              key={group.id}
              // 3. APPLICATION DE LA COULEUR (border-l-4 + borderClass)
              className={`hover:shadow-md transition-shadow relative group overflow-hidden border-l-4 ${borderClass}`}
            >
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
                  {/* 'relative z-10' permet aux boutons de rester cliquables au-dessus du lien global */}
                  {isAdmin && (
                    <div className="flex items-center gap-1 relative z-10">
                      <MoveGroupButtons id={group.id} isFirst={isFirst} isLast={isLast} />
                      <div className="w-px h-6 bg-slate-200 mx-1"></div>
                      <GroupDialog mode="edit" referentials={allRefs} group={group} />
                      <DeleteGroupButton id={group.id} />
                    </div>
                  )}
                </div>
                <CardDescription>{group.schoolYear}</CardDescription>
              </CardHeader>

              <CardContent>
                {/* J'ai retiré le <Link> ici car toute la carte est déjà un lien grâce au titre */}
                <div className="text-sm text-muted-foreground mt-2">
                  Cliquez pour gérer les élèves
                </div>
              </CardContent>
            </Card>
          );
        })}

        {classes.length === 0 && (
          <div className="col-span-full text-center py-12 border-2 border-dashed rounded-lg text-muted-foreground">
            Aucune classe pour le moment. Créez-en une nouvelle !
          </div>
        )}
      </div>
    </div>
  );
}