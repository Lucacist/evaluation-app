"use client";

import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, Loader2 } from "lucide-react";
import { moveGroupAction } from "@/actions/settings";
import { useTransition } from "react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation"; // <--- IMPORT 1

export function MoveGroupButtons({ id, isFirst, isLast }: { id: number, isFirst: boolean, isLast: boolean }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter(); // <--- IMPORT 2

  const handleMove = (direction: "up" | "down") => {
    startTransition(async () => {
      // 1. On appelle l'action serveur
      const result = await moveGroupAction(id, direction);
      
      if (result?.success) {
        // 2. FORCE LE RAFRAÎCHISSEMENT DE LA PAGE
        router.refresh(); 
      }
    });
  };

  return (
    <div className="flex flex-col gap-0.5 ml-1">
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-5 w-5 hover:bg-slate-200"
        disabled={isPending || isFirst}
        onClick={(e) => {
             e.preventDefault();
             e.stopPropagation(); // Ajout de sécurité
             handleMove("up");
        }}
      >
        {isPending ? <Loader2 className="h-3 w-3 animate-spin"/> : <ChevronUp className={cn("h-4 w-4", isFirst ? "text-slate-300" : "text-slate-600")} />}
      </Button>

      <Button 
        variant="ghost" 
        size="icon" 
        className="h-5 w-5 hover:bg-slate-200"
        disabled={isPending || isLast}
        onClick={(e) => {
             e.preventDefault(); 
             e.stopPropagation(); // Ajout de sécurité
             handleMove("down");
        }}
      >
        {isPending ? <Loader2 className="h-3 w-3 animate-spin"/> : <ChevronDown className={cn("h-4 w-4", isLast ? "text-slate-300" : "text-slate-600")} />}
      </Button>
    </div>
  );
}