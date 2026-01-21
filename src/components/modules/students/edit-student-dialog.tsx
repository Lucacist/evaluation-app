"use client";

import { useState, useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Loader2 } from "lucide-react";
import { updateStudentAction } from "@/actions/students";

// On définit le type des props pour savoir ce qu'on reçoit
type Props = {
  student: { id: number; firstName: string; lastName: string; email: string | null };
  currentGroupId: number;
  allGroups: { id: number; name: string }[];
};

export function EditStudentDialog({ student, currentGroupId, allGroups }: Props) {
  const [open, setOpen] = useState(false);
  const [state, formAction, isPending] = useActionState(updateStudentAction, null);

  useEffect(() => {
    if (state?.success) setOpen(false);
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="mr-2 h-4 w-4" />
          Modifier
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Modifier l'élève</DialogTitle>
        </DialogHeader>

        <form action={formAction} className="grid gap-4 py-4">
          <input type="hidden" name="studentId" value={student.id} />
          
          <div className="grid gap-2">
            <Label>Nom</Label>
            <Input name="lastName" defaultValue={student.lastName} required />
          </div>
          
          <div className="grid gap-2">
            <Label>Prénom</Label>
            <Input name="firstName" defaultValue={student.firstName} required />
          </div>

          <div className="grid gap-2">
            <Label>Email</Label>
            <Input name="email" type="email" defaultValue={student.email || ""} />
          </div>

          <div className="grid gap-2">
            <Label>Classe / Groupe</Label>
            <Select name="groupId" defaultValue={currentGroupId.toString()}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une classe" />
              </SelectTrigger>
              <SelectContent>
                {allGroups.map((group) => (
                  <SelectItem key={group.id} value={group.id.toString()}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enregistrer les modifications
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}