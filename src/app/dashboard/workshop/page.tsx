import { db } from "@/db";
import { tps, vehicles } from "@/db/schema";
import { desc } from "drizzle-orm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TpManagement } from "@/components/modules/workshop/tp-management";
import { VehicleManagement } from "@/components/modules/workshop/vehicle-management";
import { Wrench, Car } from "lucide-react";

export default async function WorkshopAdminPage() {
  // On récupère les données côté serveur
  const allTps = await db.select().from(tps).orderBy(desc(tps.id));
  const allVehicles = await db.select().from(vehicles).orderBy(desc(vehicles.id));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Administration Atelier</h1>
        <p className="text-muted-foreground">Gérez ici les ressources disponibles pour les séances.</p>
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
          <TpManagement data={allTps} />
        </TabsContent>

        <TabsContent value="vehicles" className="mt-6">
          <VehicleManagement data={allVehicles} />
        </TabsContent>
      </Tabs>
    </div>
  );
}