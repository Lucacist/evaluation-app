"use client";

import { useState, useTransition } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Save, FolderTree, Layers, ListChecks } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  createPoleAction, deletePoleAction, 
  createActivityAction, deleteActivityAction,
  createBlockAction, deleteBlockAction,
  createCriterionAction, deleteCriterionAction 
} from "@/actions/settings";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

// Un petit composant générique pour ajouter un élément (Dialog)
function AddItemDialog({ title, onAdd }: { title: string, onAdd: (v1: string, v2: string) => void }) {
  const [val1, setVal1] = useState("");
  const [val2, setVal2] = useState("");
  const [open, setOpen] = useState(false);

  const handleSubmit = () => {
    onAdd(val1, val2);
    setVal1(""); setVal2(""); setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1 h-7 text-xs">
          <Plus className="h-3 w-3" /> Ajouter
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <div className="grid gap-4 py-4">
          <Input placeholder="Titre / Libellé" value={val1} onChange={e => setVal1(e.target.value)} />
          <Input placeholder="Code (Optionnel)" value={val2} onChange={e => setVal2(e.target.value)} />
        </div>
        <DialogFooter><Button onClick={handleSubmit}>Enregistrer</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ReferentialTab({ referential }: { referential: any[] }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="space-y-4">
      
      {/* HEADER : Ajouter un Pôle */}
      <div className="flex justify-between items-center bg-slate-100 p-4 rounded-lg">
        <h2 className="font-semibold flex items-center gap-2">
          <FolderTree className="h-5 w-5" /> Structure du Référentiel
        </h2>
        <AddItemDialog 
          title="Nouveau Pôle" 
          onAdd={(title) => startTransition(() => createPoleAction(title, referential.length + 1))} 
        />
      </div>

      {/* ARBRE HIERARCHIQUE */}
      {referential.map((pole) => (
        <div key={pole.id} className="border rounded-md p-4 bg-white shadow-sm">
          
          {/* NIVEAU 1 : PÔLE */}
          <div className="flex items-center justify-between mb-4 border-b pb-2">
            <h3 className="text-lg font-bold text-primary">{pole.title}</h3>
            <div className="flex gap-2">
               <AddItemDialog 
                  title="Nouvelle Activité" 
                  onAdd={(title, code) => startTransition(() => createActivityAction(pole.id, title, code))} 
               />
               <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => startTransition(async () => { await deletePoleAction(pole.id)})}>
                 <Trash2 className="h-4 w-4" />
               </Button>
            </div>
          </div>

          <Accordion type="multiple" className="pl-4 border-l-2 border-slate-100 space-y-2">
            {pole.activities.map((activity: any) => (
              <AccordionItem key={activity.id} value={`act-${activity.id}`} className="border rounded bg-slate-50/50">
                
                {/* NIVEAU 2 : ACTIVITÉ */}
                <div className="flex items-center justify-between pr-4 py-2">
                  <AccordionTrigger className="hover:no-underline py-0 px-4 flex-1">
                    <div className="flex items-center gap-2 text-left">
                      <Badge variant="outline">{activity.code}</Badge>
                      <span className="font-medium text-sm">{activity.title}</span>
                    </div>
                  </AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <AddItemDialog 
                      title="Nouveau Bloc de Compétences" 
                      onAdd={(title, code) => startTransition(() => createBlockAction(activity.id, title, code))} 
                    />
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400" onClick={() => startTransition(async () => { await deleteActivityAction(activity.id)})}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-4 pt-2">
                    {activity.blocks.map((block: any) => (
                      <div key={block.id} className="ml-4 pl-4 border-l-2 border-slate-200">
                        
                        {/* NIVEAU 3 : BLOC */}
                        <div className="flex justify-between items-center bg-white p-2 rounded border mb-2">
                          <div className="flex items-center gap-2">
                            <Layers className="h-4 w-4 text-muted-foreground" />
                            <span className="font-semibold text-sm">{block.code} - {block.title}</span>
                          </div>
                          <div className="flex gap-2">
                            <AddItemDialog 
                              title="Nouveau Critère" 
                              onAdd={(label) => startTransition(() => createCriterionAction(block.id, label))} 
                            />
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400" onClick={() => startTransition(async () => { await deleteBlockAction(block.id)})}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        {/* NIVEAU 4 : CRITÈRES (LISTE) */}
                        <div className="space-y-1 ml-2">
                          {block.criteria.map((criterion: any) => (
                            <div key={criterion.id} className="flex justify-between items-center text-sm text-slate-600 hover:bg-slate-100 p-1 rounded">
                              <div className="flex items-center gap-2">
                                <ListChecks className="h-3 w-3" />
                                {criterion.label}
                              </div>
                              <Button variant="ghost" size="icon" className="h-5 w-5 text-slate-400 hover:text-red-500" onClick={() => startTransition(async () => { await deleteCriterionAction(criterion.id)})}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>

                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

        </div>
      ))}
    </div>
  );
}