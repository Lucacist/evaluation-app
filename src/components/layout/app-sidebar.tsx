"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { GraduationCap, LayoutDashboard, Settings, LogOut, BookOpen } from "lucide-react";
import { logoutAction } from "@/actions/auth";

// Les liens de navigation
const navItems = [
  { label: "Mes Classes", href: "/dashboard", icon: LayoutDashboard },
  // On ajoutera ça plus tard
  { label: "Référentiel", href: "/dashboard/settings", icon: BookOpen }, 
];

export function AppSidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <div className={cn("flex h-full flex-col border-r bg-card", className)}>
      
      {/* 1. Logo / En-tête Sidebar */}
      <div className="flex h-16 items-center border-b px-6">
        <GraduationCap className="mr-2 h-6 w-6 text-primary" />
        <span className="font-bold text-lg">Suivi Compétences</span>
      </div>

      {/* 2. Menu de Navigation */}
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid gap-1 px-2">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            // On vérifie si on est sur la page active
            const isActive = pathname === item.href; 

            return (
              <Link
                key={index}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:bg-muted hover:text-primary"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* 3. Pied de page (Logout) */}
      <div className="border-t p-4">
        <form action={logoutAction}>
          <Button variant="outline" className="w-full justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-50">
            <LogOut className="h-4 w-4" />
            Déconnexion
          </Button>
        </form>
      </div>
    </div>
  );
}