import { db } from "@/db";
import { groups, poles, activities, competenceBlocks, criteria } from "@/db/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GroupsTab } from "@/components/modules/settings/groups-tab";
import { ReferentialTab } from "@/components/modules/settings/referential-tab";

export default async function SettingsPage() {
  
  // 1. Charger les Groupes
  const allGroups = await db.select().from(groups);

  // 2. Charger tout le Référentiel
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Administration</h1>
        <p className="text-muted-foreground">
          Gérez vos classes et la structure pédagogique.
        </p>
      </div>

      <Tabs defaultValue="referential" className="space-y-4">
        <TabsList>
          <TabsTrigger value="referential">Référentiel & Compétences</TabsTrigger>
          <TabsTrigger value="groups">Classes & Groupes</TabsTrigger>
        </TabsList>

        <TabsContent value="referential" className="space-y-4">
          <ReferentialTab referential={fullReferential} />
        </TabsContent>

        <TabsContent value="groups" className="space-y-4">
          <GroupsTab groups={allGroups} />
        </TabsContent>
      </Tabs>
    </div>
  );
}