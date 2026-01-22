"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteGroupAction } from "@/actions/settings";

export function DeleteGroupButton({ id }: { id: number }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
      disabled={isPending}
      onClick={() => {
        if (confirm("Êtes-vous sûr de vouloir supprimer cette classe et tous ses élèves ?")) {
          startTransition(async () => {
            await deleteGroupAction(id);
          });
        }
      }}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}