"use client";

import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { assignVehicleAction, assignTpAction } from "@/actions/workshop";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  student: any;
  allVehicles: any[];
  allTps: any[];
  groupId: number;
  takenVehicleIds: number[]; // Liste des véhicules pris par les autres
};

export function StudentRow({ student, allVehicles, allTps, groupId, takenVehicleIds }: Props) {
  const [loadingV, setLoadingV] = useState(false);
  const [loadingT, setLoadingT] = useState(false);

  const handleVehicleChange = async (val: string) => {
    setLoadingV(true);
    const vId = val === "none" ? null : parseInt(val);
    const res = await assignVehicleAction(student.id, vId, groupId);
    if (res?.error) alert(res.error);
    setLoadingV(false);
  };

  const handleTpChange = async (val: string) => {
    setLoadingT(true);
    const tId = val === "none" ? null : parseInt(val);
    await assignTpAction(student.id, tId);
    setLoadingT(false);
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white border rounded-lg shadow-sm mb-2">
      
      {/* NOM DE L'ÉLÈVE */}
      <div className="w-1/4 font-semibold text-lg">
        {student.lastName.toUpperCase()} {student.firstName}
      </div>

      {/* SÉLECTEUR TP */}
      <div className="w-1/3 px-2">
        <Select 
          disabled={loadingT} 
          onValueChange={handleTpChange} 
          value={student.currentTpId?.toString() || "none"}
        >
          <SelectTrigger className={cn("w-full", student.currentTp ? "bg-blue-50 border-blue-200" : "")}>
            {loadingT ? <Loader2 className="animate-spin h-4 w-4" /> : <SelectValue placeholder="Choisir un TP..." />}
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            <SelectItem value="none" className="text-muted-foreground italic">-- Aucun TP --</SelectItem>
            {allTps.map((tp) => (
              <SelectItem key={tp.id} value={tp.id.toString()}>
                <span className={cn("px-2 py-0.5 rounded text-xs mr-2", tp.color)}>{tp.category}</span>
                {tp.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* SÉLECTEUR VÉHICULE */}
      <div className="w-1/3 px-2">
        <Select 
          disabled={loadingV} 
          onValueChange={handleVehicleChange} 
          value={student.currentVehicleId?.toString() || "none"}
        >
          <SelectTrigger className={cn("w-full", student.currentVehicle ? "bg-green-50 border-green-200" : "")}>
             {loadingV ? <Loader2 className="animate-spin h-4 w-4" /> : <SelectValue placeholder="Choisir un véhicule..." />}
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            <SelectItem value="none" className="text-muted-foreground italic">-- Aucun --</SelectItem>
            {allVehicles.map((v) => {
              // On grise si pris par un autre
              const isTaken = takenVehicleIds.includes(v.id) && v.id !== student.currentVehicleId;
              return (
                <SelectItem key={v.id} value={v.id.toString()} disabled={isTaken} className={isTaken ? "opacity-50" : ""}>
                  {v.name} {isTaken ? "(Pris)" : ""}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

    </div>
  );
}