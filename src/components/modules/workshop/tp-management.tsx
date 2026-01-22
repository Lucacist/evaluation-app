"use client";

import { useState, useTransition } from "react";
import { createTpAction, deleteTpAction } from "@/actions/admin-workshop";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function TpManagement({ data }: { data: any[] }) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [color, setColor] = useState("bg-gray-400");

  const handleSubmit = () => {
    if (!title || !category) return;
    startTransition(async () => {
      await createTpAction(title, category, color);
      setOpen(false);
      setTitle("");
      setCategory("");
    });
  };

  const handleDelete = (id: number) => {
    if(!confirm("Supprimer ce TP ?")) return;
    startTransition(async () => {
      await deleteTpAction(id);
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Nouveau TP</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Créer un TP</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <Input placeholder="Titre (ex: Vidange)" value={title} onChange={e => setTitle(e.target.value)} />
              
              <Select onValueChange={setCategory} value={category}>
                <SelectTrigger><SelectValue placeholder="Catégorie" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Moteur">Moteur</SelectItem>
                  <SelectItem value="Freinage">Freinage</SelectItem>
                  <SelectItem value="Transmission">Transmission</SelectItem>
                  <SelectItem value="Électricité">Électricité</SelectItem>
                  <SelectItem value="Carrosserie">Carrosserie</SelectItem>
                  <SelectItem value="Entretien">Entretien</SelectItem>
                </SelectContent>
              </Select>

              <Select onValueChange={setColor} value={color}>
                <SelectTrigger><SelectValue placeholder="Couleur" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="bg-red-500">Rouge</SelectItem>
                  <SelectItem value="bg-blue-500">Bleu</SelectItem>
                  <SelectItem value="bg-green-500">Vert</SelectItem>
                  <SelectItem value="bg-yellow-500">Jaune</SelectItem>
                  <SelectItem value="bg-purple-500">Violet</SelectItem>
                  <SelectItem value="bg-gray-400">Gris</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button onClick={handleSubmit} disabled={isPending}>Ajouter</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-md">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-4 py-3">TP</th>
              <th className="px-4 py-3">Catégorie</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.map((tp) => (
              <tr key={tp.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${tp.color}`}></div>
                    {tp.title}
                  </div>
                </td>
                <td className="px-4 py-3"><Badge variant="outline">{tp.category}</Badge></td>
                <td className="px-4 py-3 text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(tp.id)} disabled={isPending}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}