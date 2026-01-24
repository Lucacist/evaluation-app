"use client";

import { useState, useTransition } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// Correction 1 : On retire 'selectedColor' des imports d'icônes
import { Plus, Pencil, Loader2, Check } from "lucide-react";
import { createGroupAction, updateGroupAction } from "@/actions/settings";
// Correction 2 : On importe la fonction utilitaire cn
import { cn } from "@/lib/utils";

type Props = {
  mode: "create" | "edit";
  referentials: any[];
  group?: any; // Optionnel si mode create
};

// 1. Définition de la palette de couleurs disponibles
const COLORS = [
  { name: "blue", class: "bg-blue-500", border: "border-blue-500" },
  { name: "green", class: "bg-emerald-500", border: "border-emerald-500" },
  { name: "purple", class: "bg-violet-500", border: "border-violet-500" },
  { name: "red", class: "bg-rose-500", border: "border-rose-500" },
  { name: "orange", class: "bg-amber-500", border: "border-amber-500" },
  { name: "slate", class: "bg-slate-500", border: "border-slate-500" },
  { name: "indigo", class: "bg-indigo-500", border: "border-indigo-500" },
  { name: "pink", class: "bg-pink-500", border: "border-pink-500" },
  { name: "cyan", class: "bg-cyan-500", border: "border-cyan-500" },
  { name: "teal", class: "bg-teal-500", border: "border-teal-500" },
  { name: "lime", class: "bg-lime-500", border: "border-lime-500" },
  { name: "yellow", class: "bg-yellow-500", border: "border-yellow-500" },
  { name: "fuchsia", class: "bg-fuchsia-500", border: "border-fuchsia-500" },
  { name: "sky", class: "bg-sky-500", border: "border-sky-500" },
  { name: "emerald", class: "bg-emerald-500", border: "border-emerald-500" },
  { name: "rose", class: "bg-rose-500", border: "border-rose-500" },
  { name: "amber", class: "bg-amber-500", border: "border-amber-500" },
  { name: "violet", class: "bg-violet-500", border: "border-violet-500" },
  { name: "gray", class: "bg-gray-500", border: "border-gray-500" },
  { name: "zinc", class: "bg-zinc-500", border: "border-zinc-500" },
];

export function GroupDialog({ mode, referentials, group }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // États du formulaire
  const [name, setName] = useState(group?.name || "");
  const [schoolYear, setSchoolYear] = useState(group?.schoolYear || "");
  const [refId, setRefId] = useState(group?.referentialId?.toString() || "");
  // Correction 3 : "blue" par défaut (car "white" n'existe pas dans ta liste COLORS)
  const [selectedColor, setSelectedColor] = useState(group?.color || "blue");

  const handleSubmit = () => {
    startTransition(async () => {
      if (mode === "create") {
        await createGroupAction(name, schoolYear, parseInt(refId), selectedColor);
      } else {
        await updateGroupAction(group.id, name, schoolYear, parseInt(refId), selectedColor);
      }
      setOpen(false);
      // Reset si création
      if (mode === "create") {
        setName(""); setSchoolYear(""); setRefId(""); setSelectedColor("blue");
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
            <Label>Couleur de l'étiquette</Label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setSelectedColor(c.name)}
                  type="button"
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                    c.class,
                    selectedColor === c.name 
                      ? "ring-2 ring-offset-2 ring-black dark:ring-white scale-110" 
                      : "hover:scale-105 opacity-80 hover:opacity-100"
                  )}
                >
                  {selectedColor === c.name && <Check className="h-4 w-4 text-white" />}
                </button>
              ))}
            </div>
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