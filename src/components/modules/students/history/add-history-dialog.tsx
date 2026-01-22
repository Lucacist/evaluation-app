"use client";

import { useState, useTransition } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { addHistoryEntryAction } from "@/actions/workshop";

export function AddHistoryDialog({ studentId, allTps }: { studentId: number, allTps: any[] }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [selectedTp, setSelectedTp] = useState<string>("");
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]); // Date du jour par défaut

  const handleSubmit = () => {
    if (!selectedTp || !date) return;

    startTransition(async () => {
      await addHistoryEntryAction(studentId, parseInt(selectedTp), new Date(date));
      setOpen(false);
      setSelectedTp("");
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="mr-2 h-4 w-4" /> Ajouter manuellement
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter un TP à l'historique</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Date de réalisation</Label>
            <Input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
            />
          </div>

          <div className="space-y-2">
            <Label>TP Réalisé</Label>
            <Select onValueChange={setSelectedTp} value={selectedTp}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un TP" />
              </SelectTrigger>
              <SelectContent>
                {allTps.map((tp) => (
                  <SelectItem key={tp.id} value={tp.id.toString()}>
                    {tp.category} - {tp.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isPending || !selectedTp}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Ajouter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}