import { AppSidebar } from "@/components/layout/app-sidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, GraduationCap } from "lucide-react"; // Icône Burger

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      
      {/* A. Sidebar pour Desktop (Cachée sur mobile) */}
      <div className="hidden border-r bg-muted/40 md:block">
        <AppSidebar />
      </div>

      {/* B. Zone Principale */}
      <div className="flex flex-col">
        
        {/* Header Mobile (Visible uniquement sur mobile) */}
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Ouvrir le menu</span>
              </Button>
            </SheetTrigger>
            {/* Le contenu du menu mobile (C'est notre Sidebar dans un tiroir) */}
            <SheetContent side="left" className="p-0 w-[240px]">
              <AppSidebar />
            </SheetContent>
          </Sheet>
          
          {/* Logo Mobile */}
          <div className="flex items-center gap-2 font-semibold">
            <GraduationCap className="h-6 w-6" />
            <span>Suivi App</span>
          </div>
        </header>

        {/* C. Le contenu de la page (ex: Liste des élèves) */}
        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}