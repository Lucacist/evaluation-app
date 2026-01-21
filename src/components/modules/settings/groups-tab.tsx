"use client";

import { useActionState, useTransition } from "react"; // <--- Import useActionState
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Loader2 } from "lucide-react";
import { createGroupAction, deleteGroupAction } from "@/actions/settings";

export function GroupsTab({ groups }: { groups: any[] }) {
  const [isPendingDelete, startTransition] = useTransition();
  
  // CORRECTION 1 : On utilise le hook pour le formulaire
  const [state, formAction, isPendingCreate] = useActionState(createGroupAction, null);

  return (
    <div className="space-y-6">
      
      {/* Formulaire d'ajout */}
      <Card>
        <CardHeader>
          <CardTitle>Ajouter une classe</CardTitle>
          <CardDescription>Créer un nouveau groupe d'élèves.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="flex gap-4 items-end">
            <div className="grid gap-2 flex-1">
              <label className="text-sm font-medium">Nom de la classe</label>
              <Input name="name" placeholder="Ex: BTS MV 2ème Année" required />
            </div>
            <div className="grid gap-2 w-40">
              <label className="text-sm font-medium">Année</label>
              <Input name="schoolYear" placeholder="Ex: 2024-2025" required />
            </div>
            <Button type="submit" disabled={isPendingCreate}>
              {isPendingCreate ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Créer
            </Button>
          </form>
          {state?.error && <p className="text-red-500 text-sm mt-2">{state.error}</p>}
        </CardContent>
      </Card>

      {/* Liste existante */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => (
          <div key={group.id} className="flex items-center justify-between p-4 border rounded-lg bg-white shadow-sm">
            <div>
              <div className="font-bold">{group.name}</div>
              <div className="text-sm text-muted-foreground">{group.schoolYear}</div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-red-500 hover:bg-red-50 hover:text-red-600"
              disabled={isPendingDelete}
              // CORRECTION 2 : On met des accolades { } pour ignorer le retour
              onClick={() => startTransition(async () => { await deleteGroupAction(group.id) })}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}