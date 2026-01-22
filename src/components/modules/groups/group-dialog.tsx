"use client";

import { useState, useTransition } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Loader2 } from "lucide-react";
import { createGroupAction, updateGroupAction } from "@/actions/settings";

type Props = {
  mode: "create" | "edit";
  referentials: any[];
  group?: any; // Optionnel si mode create
};

export function GroupDialog({ mode, referentials, group }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // États du formulaire
  const [name, setName] = useState(group?.name || "");
  const [schoolYear, setSchoolYear] = useState(group?.schoolYear || "");
  const [refId, setRefId] = useState(group?.referentialId?.toString() || "");

  const handleSubmit = () => {
    startTransition(async () => {
      if (mode === "create") {
        await createGroupAction(name, schoolYear, parseInt(refId));
      } else {
        await updateGroupAction(group.id, name, schoolYear, parseInt(refId));
      }
      setOpen(false);
      // Reset si création
      if (mode === "create") {
        setName(""); setSchoolYear(""); setRefId("");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === "create" ? (
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Nouvelle Classe
          </Button>
        ) : (
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500 hover:text-blue-600">
            <Pencil className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Ajouter une classe" : "Modifier la classe"}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Nom de la classe</Label>
            <Input placeholder="Ex: BTS MV 1ère Année" value={name} onChange={e => setName(e.target.value)} />
          </div>
          
          <div className="space-y-2">
            <Label>Année Scolaire</Label>
            <Input placeholder="Ex: 2025-2026" value={schoolYear} onChange={e => setSchoolYear(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Référentiel Associé</Label>
            <Select value={refId} onValueChange={setRefId}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir un référentiel..." />
              </SelectTrigger>
              <SelectContent>
                {referentials.map((ref) => (
                  <SelectItem key={ref.id} value={ref.id.toString()}>
                    {ref.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Détermine la grille de compétences utilisée pour cette classe.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isPending || !name || !schoolYear || !refId}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === "create" ? "Créer" : "Enregistrer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}