"use client";

import { useState, useTransition } from "react";
import { createVehicleAction, deleteVehicleAction } from "@/actions/admin-workshop";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Trash2, Plus, Car } from "lucide-react";

export function VehicleManagement({ data, isAdmin }: { data: any[], isAdmin: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const [name, setName] = useState("");
  const [plate, setPlate] = useState("");

  const handleSubmit = () => {
    if (!name) return;
    startTransition(async () => {
      await createVehicleAction(name, plate);
      setOpen(false);
      setName("");
      setPlate("");
    });
  };

  const handleDelete = (id: number) => {
    if (!confirm("Supprimer ce véhicule ?")) return;
    startTransition(async () => { await deleteVehicleAction(id) });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        {isAdmin && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" /> Nouveau Véhicule</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Ajouter un Véhicule</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Input placeholder="Modèle (ex: Clio V)" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Input placeholder="Immatriculation (ex: AA-123-BB)" value={plate} onChange={e => setPlate(e.target.value)} />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleSubmit} disabled={isPending}>Ajouter</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((v) => (
          <div key={v.id} className="border rounded-lg p-4 flex justify-between items-center bg-white shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 rounded-full">
                <Car className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <div className="font-bold">{v.name}</div>
                <div className="text-xs text-muted-foreground font-mono bg-slate-100 px-1 rounded">
                  {v.plate || "Pas d'immat."}
                </div>
              </div>
            </div>
            {isAdmin && (
              <Button variant="ghost" size="icon" onClick={() => handleDelete(v.id)} disabled={isPending}>
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}