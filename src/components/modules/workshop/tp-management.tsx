"use client";

import { useState, useTransition } from "react";
import { createTpAction, deleteTpAction, updateTpAction } from "@/actions/admin-workshop";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, Loader2, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// MODIF 1 : On ajoute `isAdmin` dans les props attendues par le composant
export function TpManagement({ data, isAdmin, groups }: { data: any[], isAdmin: boolean, groups: any[] }) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingTp, setEditingTp] = useState<any>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [color, setColor] = useState("bg-gray-400");
  const [groupId, setGroupId] = useState<string>("all");

  // Edit form states
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editColor, setEditColor] = useState("");
  const [editGroupId, setEditGroupId] = useState<string>("all");

  const handleSubmit = () => {
    if (!title || !category) return;
    startTransition(async () => {
      const gId = groupId === "all" ? null : parseInt(groupId);
      await createTpAction(title, category, color, gId);
      setOpen(false);
      setTitle("");
      setCategory("");
      setGroupId("all");
    });
  };

  const handleDelete = (id: number) => {
    if(!confirm("Supprimer ce TP ?")) return;
    startTransition(async () => {
      await deleteTpAction(id);
    });
  };

  const handleEdit = (tp: any) => {
    setEditingTp(tp);
    setEditTitle(tp.title);
    setEditCategory(tp.category || "");
    setEditColor(tp.color || "bg-gray-400");
    setEditGroupId(tp.groupId?.toString() || "all");
    setEditOpen(true);
  };

  const handleUpdate = () => {
    if (!editTitle || !editCategory || !editingTp) return;
    startTransition(async () => {
      const gId = editGroupId === "all" ? null : parseInt(editGroupId);
      await updateTpAction(editingTp.id, editTitle, editCategory, editColor, gId);
      setEditOpen(false);
      setEditingTp(null);
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        {/* MODIF 2 : On affiche le bouton "Nouveau TP" SEULEMENT si isAdmin est vrai */}
        {isAdmin && (
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

                <Select onValueChange={setGroupId} value={groupId}>
                  <SelectTrigger><SelectValue placeholder="Groupe (optionnel)" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les groupes (global)</SelectItem>
                    {groups.map((g) => (
                      <SelectItem key={g.id} value={g.id.toString()}>{g.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button onClick={handleSubmit} disabled={isPending}>Ajouter</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="border rounded-md">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-4 py-3">TP</th>
              <th className="px-4 py-3">Catégorie</th>
              {/* On cache la colonne Actions si on n'est pas admin, ou on la laisse vide */}
              {isAdmin && <th className="px-4 py-3 text-right">Actions</th>}
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
                
                {/* MODIF 3 : On affiche le bouton Supprimer SEULEMENT si isAdmin est vrai */}
                {isAdmin && (
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(tp)} disabled={isPending}>
                      <Pencil className="h-4 w-4 text-blue-500" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(tp.id)} disabled={isPending}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dialog d'édition */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Modifier le TP</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <Input placeholder="Titre" value={editTitle} onChange={e => setEditTitle(e.target.value)} />
            
            <Select onValueChange={setEditCategory} value={editCategory}>
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

            <Select onValueChange={setEditColor} value={editColor}>
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

            <Select onValueChange={setEditGroupId} value={editGroupId}>
              <SelectTrigger><SelectValue placeholder="Groupe" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les groupes (global)</SelectItem>
                {groups.map((g) => (
                  <SelectItem key={g.id} value={g.id.toString()}>{g.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Annuler</Button>
            <Button onClick={handleUpdate} disabled={isPending}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}