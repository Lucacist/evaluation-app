import { db } from "@/db";
import { groups } from "@/db/schema";
import Link from "next/link"; 
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";

export default async function DashboardPage() {
  const classes = await db.select().from(groups);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
        <p className="text-muted-foreground">Sélectionnez une classe pour voir les élèves.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((groupe) => (
          <Link key={groupe.id} href={`/dashboard/groups/${groupe.id}`}>
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer border-l-4 border-l-primary">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-bold">
                  {groupe.name}
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground mt-2">
                  Année scolaire : {groupe.schoolYear}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}