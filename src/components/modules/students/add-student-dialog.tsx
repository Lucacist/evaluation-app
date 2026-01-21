"use client";

import { useState, useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Loader2 } from "lucide-react";
import { createStudentAction } from "@/actions/students";

export function AddStudentDialog({ groupId }: { groupId: number }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(createStudentAction, null);

  // Fermer la modale automatiquement si succès
  useEffect(() => {
    if (state?.success) {
      setOpen(false);
    }
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un élève
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ajouter un élève</DialogTitle>
          <DialogDescription>
            Créez un nouvel élève et ajoutez-le à ce groupe.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="grid gap-4 py-4">
          {/* Champ caché pour passer l'ID du groupe */}
          <input type="hidden" name="groupId" value={groupId} />

          {/* Affichage des erreurs */}
          {state?.error && (
            <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
              {state.error}
            </div>
          )}

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="lastName" className="text-right">
              Nom
            </Label>
            <Input id="lastName" name="lastName" className="col-span-3" required />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="firstName" className="text-right">
              Prénom
            </Label>
            <Input id="firstName" name="firstName" className="col-span-3" required />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input 
              id="email" 
              name="email" 
              type="email" 
              placeholder="Optionnel" 
              className="col-span-3" 
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}