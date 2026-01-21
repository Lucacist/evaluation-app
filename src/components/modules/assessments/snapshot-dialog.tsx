"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Archive, Loader2 } from "lucide-react";
import { createSnapshotAction } from "@/actions/snapshot";

export function SnapshotDialog({ assessmentId }: { assessmentId: number }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("Bilan Trimestre 1");

  const handleSnapshot = async () => {
    setLoading(true);
    await createSnapshotAction(assessmentId, title);
    setLoading(false);
    setOpen(false);
    alert("Archive créée avec succès ! Vous pouvez continuer à travailler sur ce document.");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 border-primary text-primary hover:bg-primary/10">
          <Archive className="h-4 w-4" />
          Arrêter / Figer (Trimestre)
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Créer un point d'arrêt</DialogTitle>
          <DialogDescription>
            Cela va créer une copie figée des notes actuelles (Archive).
            <br />
            <strong>Vous resterez sur la fiche actuelle</strong> et pourrez continuer à modifier les notes pour la suite de l'année.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-2 py-4">
          <Label>Nom de l'archive</Label>
          <Input 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="Ex: Trimestre 1" 
          />
        </div>

        <DialogFooter>
          <Button onClick={handleSnapshot} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirmer l'archivage
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}