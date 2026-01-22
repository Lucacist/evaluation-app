"use client";

import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteHistoryEntryAction } from "@/actions/workshop";
import { useTransition } from "react";

export function DeleteHistoryButton({ id, studentId }: { id: number, studentId: number }) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if(!confirm("Êtes-vous sûr de vouloir supprimer cette ligne d'historique ?")) return;

    startTransition(async () => {
      await deleteHistoryEntryAction(id, studentId);
      // toast.success("Entrée supprimée");
    });
  };

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="h-8 w-8 text-muted-foreground hover:text-red-600"
      onClick={handleDelete}
      disabled={isPending}
    >
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </Button>
  );
}