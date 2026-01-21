"use client";

import { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { GradeSelector } from "./grade-selector";
import { saveGradeAction } from "@/actions/grades";
import { calculateAverage, getScoreColor } from "@/lib/grading";
import { cn } from "@/lib/utils";

type MatrixProps = {
  assessmentId: number;
  referential: any[]; 
  initialGrades: Record<number, number>;
  readOnly: boolean;
};

export function AssessmentMatrix({ assessmentId, referential, initialGrades, readOnly }: MatrixProps) {
  // 1. État local de toutes les notes
  const [grades, setGrades] = useState<Record<number, number>>(initialGrades);

  // 2. Fonction de mise à jour intelligente
  const handleGradeChange = async (criterionId: number, newValue: number) => {
    // A. Optimistic Update (Mise à jour immédiate de l'écran)
    setGrades((prev) => ({
      ...prev,
      [criterionId]: newValue,
    }));

    // B. Sauvegarde en base de données
    const result = await saveGradeAction(assessmentId, criterionId, newValue);
    if (result?.error) {
      alert("Erreur lors de la sauvegarde !");
      // En cas d'erreur, on pourrait annuler le changement ici
    }
  };

  return (
    <div className="space-y-6">
      {referential.map((pole) => (
        <div key={pole.id} className="space-y-4">
          
          <h2 className="text-xl font-bold text-slate-800 border-b pb-2">
            {pole.title}
          </h2>

          <Accordion type="multiple" className="w-full space-y-2">
            {pole.activities.map((activity: any) => {
              
              // --- CALCUL DE MOYENNE TEMPS RÉEL (ACTIVITÉ) ---
              // 1. On récupère tous les IDs de critères de cette activité
              const activityCriteriaIds: number[] = [];
              activity.blocks.forEach((b: any) => 
                b.criteria.forEach((c: any) => activityCriteriaIds.push(c.id))
              );

              // 2. On récupère les notes correspondantes dans notre state local
              const activityGrades = activityCriteriaIds.map(id => grades[id]);
              
              // 3. On calcule
              const average = calculateAverage(activityGrades);
              // ------------------------------------------------

              return (
                <AccordionItem 
                  key={activity.id} 
                  value={`activity-${activity.id}`} 
                  className="border rounded-lg bg-white px-4"
                >
                  <AccordionTrigger className="hover:no-underline py-4">
                    <div className="flex items-center justify-between w-full pr-4">
                      
                      {/* Partie Gauche : Titre */}
                      <div className="flex items-center text-left gap-3">
                        <Badge variant="outline" className="text-primary border-primary">
                          {activity.code}
                        </Badge>
                        <span className="font-semibold text-lg">{activity.title}</span>
                      </div>

                      {/* Partie Droite : MOYENNE DE L'ACTIVITÉ */}
                      {average !== null && (
                        <div className={cn("px-3 py-1 rounded-full text-sm font-bold border", getScoreColor(average))}>
                          Moy: {average}%
                        </div>
                      )}

                    </div>
                  </AccordionTrigger>
                  
                  <AccordionContent className="pt-4 pb-6 space-y-6">
                    {activity.blocks.map((block: any) => {
                        
                        // --- CALCUL MOYENNE (SOUS-COMPÉTENCE / BLOC) ---
                        const blockGrades = block.criteria.map((c: any) => grades[c.id]);
                        const blockAvg = calculateAverage(blockGrades);
                        // -----------------------------------------------

                        return (
                          <div key={block.id} className="space-y-3">
                            
                            <div className="bg-slate-100 p-2 rounded text-sm font-semibold text-slate-700 flex justify-between items-center">
                              <div className="flex gap-2">
                                <span>{block.code}</span>
                                <span>{block.title}</span>
                              </div>
                              {/* Moyenne du bloc */}
                              {blockAvg !== null && (
                                <span className={cn("text-xs px-2 py-0.5 rounded border", getScoreColor(blockAvg))}>
                                  {blockAvg}%
                                </span>
                              )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {block.criteria.map((criterion: any) => (
                                <Card key={criterion.id} className="p-4 flex flex-col justify-between gap-4 shadow-sm">
                                  <p className="text-sm text-slate-600 leading-relaxed">
                                    {criterion.label}
                                  </p>
                                  
                                  <div className="flex justify-end pt-2 border-t mt-2">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-muted-foreground uppercase font-semibold">Note</span>
                                      {/* On passe la fonction de mise à jour */}
                                      <GradeSelector 
                                        value={grades[criterion.id] ?? null}
                                        onChange={(val) => handleGradeChange(criterion.id, val)}
                                        readOnly={readOnly}
                                      />
                                    </div>
                                  </div>
                                </Card>
                              ))}
                            </div>
                          </div>
                        );
                    })}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>

        </div>
      ))}
    </div>
  );
}