"use client";

import { useTheme, Theme, themeColors } from "@/components/theme-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Palette } from "lucide-react";
import { cn } from "@/lib/utils";

const lightThemes: { value: Theme; label: string; color: string }[] = [
  { value: "default", label: "Par défaut", color: "bg-slate-100" },
  { value: "blue", label: "Bleu", color: "bg-blue-100" },
  { value: "green", label: "Vert", color: "bg-green-100" },
  { value: "purple", label: "Violet", color: "bg-purple-100" },
  { value: "orange", label: "Orange", color: "bg-orange-100" },
  { value: "rose", label: "Rose", color: "bg-rose-100" },
];

const darkThemes: { value: Theme; label: string; color: string }[] = [
  { value: "slate-dark", label: "Gris", color: "bg-slate-300" },
  { value: "blue-dark", label: "Bleu", color: "bg-blue-300" },
  { value: "green-dark", label: "Vert", color: "bg-green-300" },
  { value: "purple-dark", label: "Violet", color: "bg-purple-300" },
  { value: "orange-dark", label: "Orange", color: "bg-orange-300" },
  { value: "rose-dark", label: "Rose", color: "bg-rose-300" },
];

export default function UserSettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
        <p className="text-muted-foreground">Personnalisez l'apparence de l'application.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Couleur de fond
          </CardTitle>
          <CardDescription>
            Choisissez la couleur de fond de l'application.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Couleurs claires */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Couleurs claires</h3>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              {lightThemes.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTheme(t.value)}
                  className={cn(
                    "relative flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all hover:scale-105",
                    theme === t.value
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-transparent hover:border-slate-200"
                  )}
                >
                  <div className={cn("w-12 h-12 rounded-full border shadow-sm", t.color)} />
                  <span className="text-sm font-medium">{t.label}</span>
                  {theme === t.value && (
                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-0.5">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Couleurs foncées */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Couleurs foncées</h3>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              {darkThemes.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTheme(t.value)}
                  className={cn(
                    "relative flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all hover:scale-105",
                    theme === t.value
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-transparent hover:border-slate-200"
                  )}
                >
                  <div className={cn("w-12 h-12 rounded-full border shadow-sm", t.color)} />
                  <span className="text-sm font-medium">{t.label}</span>
                  {theme === t.value && (
                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-0.5">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
