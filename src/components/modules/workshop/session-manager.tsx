"use client";

import { StudentRow } from "./student-row";
import { Button } from "@/components/ui/button";
import { RotateCcw, Save } from "lucide-react";
// ATTENTION : On importe les 2 nouvelles actions qu'on vient de créer
import { resetGroupAction, saveSessionHistoryAction } from "@/actions/workshop";
import { useTransition } from "react";

export function SessionManager({ students, vehicles, tps, groupId }: any) {
  const [isPending, startTransition] = useTransition();

  // On calcule la liste des véhicules occupés pour filtrer dans les lignes
  const takenVehicleIds = students
    .map((s: any) => s.currentVehicleId)
    .filter((id: any) => id !== null) as number[];

  // 1. GESTION DE L'ENREGISTREMENT (Historique)
  const handleSaveSession = () => {
    startTransition(async () => {
      const result = await saveSessionHistoryAction(groupId);
      if (result.error) {
        alert("Erreur : " + result.error);
      } else {
        // Petit message de succès
        alert(`✅ Séance enregistrée ! ${result.count || 0} élève(s) ajouté(s) à l'historique.`);
      }
    });
  };

  // 2. GESTION DE LA REMISE À ZÉRO (Véhicules + TPs)
  const handleReset = () => {
    if (!confirm("Attention : Cela va détacher tous les véhicules et les TPs des élèves. Continuer ?")) {
      return;
    }

    startTransition(async () => {
      await resetGroupAction(groupId);
    });
  };

  return (
    <div className="space-y-4">
      
      {/* BARRE D'ACTIONS */}
      <div className="flex justify-end gap-3 bg-slate-50 p-3 rounded-lg mb-4 border border-slate-100">
        
        {/* Bouton Enregistrer (Vert) */}
        <Button 
          variant="default" 
          onClick={handleSaveSession} 
          disabled={isPending}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Save className="mr-2 h-4 w-4" />
          Enregistrer la séance
        </Button>

        {/* Bouton RAZ (Rouge) */}
        <Button 
          variant="destructive" 
          onClick={handleReset}
          disabled={isPending}
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Fin de séance (RAZ)
        </Button>
      </div>

      {/* LISTE DES ÉLÈVES */}
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

        {students.length === 0 && (
          <div className="text-center py-10 text-muted-foreground italic border-2 border-dashed rounded-lg">
            Aucun élève dans cette classe.
          </div>
        )}
      </div>
    </div>
  );
}