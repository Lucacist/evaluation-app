"use client";

import { Button } from "@/components/ui/button";
import { FilePlus, Loader2 } from "lucide-react";
import { createAssessmentAction } from "@/actions/assessments";
import { useState } from "react";

export function CreateAssessmentButton({ studentId, groupId }: { studentId: number, groupId: number }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    // On appelle l'action serveur directement
    await createAssessmentAction(studentId, groupId);
  };

  return (
    <Button onClick={handleClick} disabled={isLoading}>
      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FilePlus className="mr-2 h-4 w-4" />}
      Nouveau Bilan
    </Button>
  );
}