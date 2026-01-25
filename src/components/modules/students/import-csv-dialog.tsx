"use client";

import { useState, useRef, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Upload, FileText, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { importStudentsFromCsvAction } from "@/actions/import-students";

type Props = {
  groupId: number;
};

export function ImportCsvDialog({ groupId }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<{ imported: number; errors: string[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleImport = () => {
    if (!file) return;

    startTransition(async () => {
      const content = await file.text();
      const res = await importStudentsFromCsvAction(groupId, content);
      setResult({ imported: res.imported, errors: res.errors });

      if (res.imported > 0 && res.errors.length === 0) {
        // Fermer après 2 secondes si tout s'est bien passé
        setTimeout(() => {
          setOpen(false);
          setFile(null);
          setResult(null);
        }, 2000);
      }
    });
  };

  const handleClose = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setFile(null);
      setResult(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          Importer CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Importer des élèves</DialogTitle>
          <DialogDescription>
            Importez un fichier CSV pour ajouter plusieurs élèves d'un coup.
            Le fichier doit contenir les colonnes NOM_APPRENANT, PRENOM_APPRENANT et EMAIL (séparateur: point-virgule).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Zone de sélection de fichier */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary hover:bg-slate-50 transition-colors"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
            {file ? (
              <div className="flex items-center justify-center gap-2 text-primary">
                <FileText className="h-8 w-8" />
                <span className="font-medium">{file.name}</span>
              </div>
            ) : (
              <div className="text-muted-foreground">
                <Upload className="h-8 w-8 mx-auto mb-2" />
                <p>Cliquez pour sélectionner un fichier CSV</p>
                <p className="text-xs mt-1">ou glissez-déposez</p>
              </div>
            )}
          </div>

          {/* Résultat de l'import */}
          {result && (
            <div className="space-y-2">
              {result.imported > 0 && (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>{result.imported} élève(s) importé(s) avec succès</span>
                </div>
              )}
              {result.errors.length > 0 && (
                <div className="bg-red-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-red-600 mb-2">
                    <AlertCircle className="h-5 w-5" />
                    <span>{result.errors.length} erreur(s)</span>
                  </div>
                  <ul className="text-xs text-red-500 space-y-1 max-h-32 overflow-auto">
                    {result.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>
            Annuler
          </Button>
          <Button onClick={handleImport} disabled={!file || isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Import en cours...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Importer
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
