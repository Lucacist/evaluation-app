import { db } from "@/db";
import { tps, vehicles, groups } from "@/db/schema";
import { desc } from "drizzle-orm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TpManagement } from "@/components/modules/workshop/tp-management";
import { VehicleManagement } from "@/components/modules/workshop/vehicle-management";
import { Wrench, Car, ShieldAlert } from "lucide-react";
import { getCurrentUser } from "@/lib/auth"; 

export default async function WorkshopAdminPage() {
  // 2. RÉCUPÉRATION DE L'UTILISATEUR (C'est la ligne qu'il te manquait)
  const user = await getCurrentUser();
  
  // 3. DÉFINITION DU RÔLE
  const isAdmin = user?.role === "admin";

  // Récupération des données
  const allTps = await db.select().from(tps).orderBy(desc(tps.id));
  const allVehicles = await db.select().from(vehicles).orderBy(desc(vehicles.id));
  const allGroups = await db.select().from(groups);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Administration Atelier</h1>
          <p className="text-muted-foreground">Gérez ici les ressources disponibles pour les séances.</p>
        </div>

        {/* Indicateur visuel (Optionnel mais pratique) */}
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

      <Tabs defaultValue="tps" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="tps" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" /> TPs ({allTps.length})
          </TabsTrigger>
          <TabsTrigger value="vehicles" className="flex items-center gap-2">
            <Car className="h-4 w-4" /> Véhicules ({allVehicles.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tps" className="mt-6">
          {/* On passe la variable isAdmin qu'on vient de créer */}
          <TpManagement data={allTps} isAdmin={isAdmin} groups={allGroups} />
        </TabsContent>

        <TabsContent value="vehicles" className="mt-6">
          {/* On n'oublie pas de le passer ici aussi ! */}
          <VehicleManagement data={allVehicles} isAdmin={isAdmin} />
        </TabsContent>
      </Tabs>
    </div>
  );
}