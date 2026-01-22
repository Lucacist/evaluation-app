"use client";

import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { assignVehicleAction, assignTpAction } from "@/actions/workshop";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// 1. CORRECTION DU TYPE PROPS
type Props = {
  student: any;
  allVehicles: any[];
  allTps: any[];
  groupId: number;
  takenVehicleIds: number[];
  isAdmin: boolean; // Ajouté ici
};

export function StudentRow({ student, allVehicles, allTps, groupId, takenVehicleIds, isAdmin }: Props) {
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
    <div className="flex items-center justify-between p-4 bg-white border rounded-lg shadow-sm mb-2 hover:bg-slate-50 transition-colors">
      
      {/* NOM DE L'ÉLÈVE */}
      <div className="w-1/4 font-semibold text-lg">
        {student.lastName.toUpperCase()} {student.firstName}
      </div>

      {/* SÉLECTEUR TP */}
      <div className="w-1/3 px-2">
        <Select 
          onValueChange={handleTpChange} 
          value={student.currentTpId?.toString() || "none"}
          // 2. CORRECTION DISABLED (Une seule ligne)
          disabled={loadingT || !isAdmin} 
        >
          <SelectTrigger className={cn("w-full", student.currentTp ? "bg-blue-50 border-blue-200 text-blue-700 font-medium" : "")}>
            {loadingT ? <Loader2 className="animate-spin h-4 w-4" /> : <SelectValue placeholder="Choisir un TP..." />}
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            <SelectItem value="none" className="text-muted-foreground italic">-- Aucun TP --</SelectItem>
            {allTps.map((tp) => (
              <SelectItem key={tp.id} value={tp.id.toString()}>
                <span className={cn("px-2 py-0.5 rounded text-xs mr-2 font-normal border", 
                    tp.color.includes("red") ? "bg-red-100 border-red-200 text-red-700" :
                    tp.color.includes("blue") ? "bg-blue-100 border-blue-200 text-blue-700" :
                    tp.color.includes("green") ? "bg-green-100 border-green-200 text-green-700" :
                    tp.color.includes("yellow") ? "bg-yellow-100 border-yellow-200 text-yellow-700" :
                    "bg-gray-100 border-gray-200 text-gray-700"
                )}>
                    {tp.category}
                </span>
                {tp.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* SÉLECTEUR VÉHICULE */}
      <div className="w-1/3 px-2">
        <Select 
          onValueChange={handleVehicleChange} 
          value={student.currentVehicleId?.toString() || "none"}
          // 3. CORRECTION DISABLED
          disabled={loadingV || !isAdmin}
        >
          <SelectTrigger className={cn("w-full", student.currentVehicle ? "bg-green-50 border-green-200 text-green-700 font-medium" : "")}>
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
                  <span className="text-xs text-muted-foreground ml-2">[{v.plate}]</span>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

    </div>
  );
}