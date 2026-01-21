"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { getScoreColor } from "@/lib/grading"; // On utilise notre helper

const GRADE_OPTIONS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

type Props = {
  value: number | null;
  onChange: (newValue: number) => Promise<void>; // C'est le parent qui gère l'action
  readOnly?: boolean;
};

export function GradeSelector({ value, onChange, readOnly }: Props) {
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSelect = async (newValue: number) => {
    setOpen(false);
    
    // Si la valeur est la même, on ne fait rien
    if (newValue === value) return;

    setIsSaving(true);
    await onChange(newValue); // On appelle la fonction du parent
    setIsSaving(false);
  };

  if (readOnly) {
    return (
      <div className={cn("px-3 py-1 rounded font-bold text-sm border", getScoreColor(value))}>
        {value !== null ? `${value}%` : "-"}
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("w-[80px] font-bold transition-all", getScoreColor(value))}
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            value !== null ? value : "-"
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-64 p-2" align="end">
        <div className="grid grid-cols-4 gap-2">
          {GRADE_OPTIONS.map((option) => (
            <button
              key={option}
              onClick={() => handleSelect(option)}
              className={cn(
                "h-10 rounded-md text-sm font-medium transition-colors hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary",
                value === option ? "bg-primary text-primary-foreground" : "bg-white border"
              )}
            >
              {option}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}