"use client";

import { Button } from "@/components/ui/button";
import { Play, Loader2 } from "lucide-react";
import { createAssessmentAction } from "@/actions/assessments"; // On réutilise ton action existante
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  studentId: number;
  groupId: number;
  existingAssessmentId?: number; // Optionnel
};

export function OpenActiveAssessmentButton({ studentId, groupId, existingAssessmentId }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleClick = async () => {
    setIsLoading(true);

    if (existingAssessmentId) {
      // Cas A : La fiche existe déjà, on y va direct
      router.push(`/dashboard/assessments/${existingAssessmentId}`);
    } else {
      // Cas B : Première fois de l'année, on crée la fiche vierge
      // L'action createAssessmentAction fait déjà le redirect
      await createAssessmentAction(studentId, groupId);
    }
  };

  return (
    <Button onClick={handleClick} disabled={isLoading} className="w-full text-lg h-12" size="lg">
      {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Play className="mr-2 h-5 w-5" />}
      {existingAssessmentId ? "Continuer le Suivi" : "Commencer l'année"}
    </Button>
  );
}