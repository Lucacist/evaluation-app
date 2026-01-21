// src/app/page.tsx
"use client";

import { useActionState } from "react"; // <--- CHANGEMENT ICI : import depuis 'react'
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction } from "@/actions/auth";
import { Loader2 } from "lucide-react"; // Optionnel : pour l'icône de chargement

const initialState = {
  error: "",
};

export default function LoginPage() {
  // CHANGEMENT ICI : useActionState remplace useFormState
  // On récupère aussi 'isPending' pour désactiver le bouton pendant le chargement
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Bienvenue
          </CardTitle>
          <CardDescription className="text-center">
            Entrez vos identifiants pour accéder au suivi.
          </CardDescription>
        </CardHeader>

        <form action={formAction}>
          <CardContent className="space-y-4">
            
            {state?.error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
                ⚠️ {state.error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                placeholder="prof@ecole.fr" 
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                required 
              />
            </div>

          </CardContent>
          
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connexion...
                </>
              ) : (
                "Se connecter"
              )}
            </Button>
          </CardFooter>
        </form>

      </Card>
    </div>
  );
}