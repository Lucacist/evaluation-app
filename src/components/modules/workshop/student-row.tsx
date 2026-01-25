"use client";

import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { assignVehicleAction, assignTpAction } from "@/actions/workshop";
import { createAssessmentAction } from "@/actions/assessments";
import { Loader2, ClipboardCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { StudentAvatar } from "@/components/modules/students/student-avatar";
import { useRouter } from "next/navigation";

// 1. CORRECTION DU TYPE PROPS
type Props = {
  student: any;
  allVehicles: any[];
  allTps: any[];
  groupId: number;
  takenVehicleIds: number[];
  isAdmin: boolean;
};

export function StudentRow({ student, allVehicles, allTps, groupId, takenVehicleIds, isAdmin }: Props) {
  const [loadingV, setLoadingV] = useState(false);
  const [loadingT, setLoadingT] = useState(false);
  const [loadingAssessment, setLoadingAssessment] = useState(false);
  const router = useRouter();

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

  const handleOpenAssessment = async () => {
    setLoadingAssessment(true);
    if (student.activeAssessmentId) {
      router.push(`/dashboard/assessments/${student.activeAssessmentId}`);
    } else {
      await createAssessmentAction(student.id, groupId);
    }
    setLoadingAssessment(false);
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-white border rounded-lg shadow-sm mb-2 hover:bg-slate-50 transition-colors w-full">
      
      {/* AVATAR */}
      <div className="flex-shrink-0">
        <StudentAvatar
          studentId={student.id}
          currentImage={student.profileImage}
          firstName={student.firstName}
          lastName={student.lastName}
          editable={isAdmin}
          size="sm"
        />
      </div>

      {/* NOM DE L'ÉLÈVE */}
      <div className="flex-1 min-w-0 font-semibold text-lg">
        {student.lastName.toUpperCase()} {student.firstName}
      </div>

      {/* SÉLECTEUR TP */}
      <div className="flex-1 min-w-0 px-2">
        <Select 
          onValueChange={handleTpChange} 
          value={student.currentTpId?.toString() || "none"}
          // 2. CORRECTION DISABLED (Une seule ligne)
          disabled={loadingT} 
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
      <div className="flex-1 min-w-0 px-2">
        <Select 
          onValueChange={handleVehicleChange} 
          value={student.currentVehicleId?.toString() || "none"}
          // 3. CORRECTION DISABLED
          disabled={loadingV }
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
                  {v.plate && <span className="text-xs text-muted-foreground ml-2">[{v.plate}]</span>}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* BOUTON NOTATION */}
      <div className="flex-shrink-0">
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleOpenAssessment}
          disabled={loadingAssessment}
        >
          {loadingAssessment ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ClipboardCheck className="h-4 w-4" />
          )}
        </Button>
      </div>

    </div>
  );
}