"use client";

import { StudentRow } from "./student-row";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { resetGroupVehiclesAction } from "@/actions/workshop";
import { useTransition } from "react";

export function SessionManager({ students, vehicles, tps, groupId }: any) {
  const [isPending, startTransition] = useTransition();

  // On calcule la liste des véhicules occupés pour filtrer dans les lignes
  const takenVehicleIds = students
    .map((s: any) => s.currentVehicleId)
    .filter((id: any) => id !== null) as number[];

  return (
    <div className="space-y-4">
      
      <div className="flex justify-end bg-slate-100 p-3 rounded-lg mb-4">
        <Button 
          variant="destructive" 
          // CORRECTION ICI : on ajoute async () => { await ... }
          onClick={() => startTransition(async () => { 
            await resetGroupVehiclesAction(groupId);
          })}
          disabled={isPending}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          RAZ Véhicules (Fin de séance)
        </Button>
      </div>

      <div>
        {students.map((student: any) => (
          <StudentRow 
            key={student.id} 
            student={student} 
            allVehicles={vehicles} 
            allTps={tps} 
            groupId={groupId}
            takenVehicleIds={takenVehicleIds}
          />
        ))}
      </div>
    </div>
  );
}