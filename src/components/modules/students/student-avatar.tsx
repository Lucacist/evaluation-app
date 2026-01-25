"use client";

import { useState, useRef, useTransition } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, Loader2, User } from "lucide-react";
import { updateStudentProfileImageAction } from "@/actions/profile-image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  studentId: number;
  currentImage?: string | null;
  firstName: string;
  lastName: string;
  editable?: boolean;
  size?: "sm" | "md" | "lg";
};

const sizeClasses = {
  sm: "h-10 w-10",
  md: "h-16 w-16",
  lg: "h-24 w-24",
};

export function StudentAvatar({
  studentId,
  currentImage,
  firstName,
  lastName,
  editable = false,
  size = "md",
}: Props) {
  const [image, setImage] = useState<string | null>(currentImage || null);
  const [isPending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier la taille (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("L'image est trop volumineuse (max 2MB)");
      return;
    }

    // Convertir en base64 et recadrer en carré
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Créer un canvas pour recadrer l'image en carré
        const canvas = document.createElement("canvas");
        const minSize = Math.min(img.width, img.height);
        const size = Math.min(minSize * 1.4, Math.max(img.width, img.height)); // Dézoomer de 40%
        canvas.width = 400;
        canvas.height = 400;
        
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        
        // Calculer le recadrage centré
        const offsetX = (img.width - size) / 2;
        const offsetY = (img.height - size) / 2;
        
        // Dessiner l'image recadrée et redimensionnée
        ctx.drawImage(
          img,
          offsetX, offsetY, size, size,  // Source (crop centré)
          0, 0, 400, 400                  // Destination (400x400)
        );
        
        // Convertir en base64
        const base64 = canvas.toDataURL("image/jpeg", 0.8);
        setPreviewImage(base64);
        setDialogOpen(true);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!previewImage) return;

    startTransition(async () => {
      const result = await updateStudentProfileImageAction(studentId, previewImage);
      if (result.success) {
        setImage(previewImage);
        setDialogOpen(false);
        setPreviewImage(null);
      } else {
        alert("Erreur lors de la mise à jour de l'image");
      }
    });
  };

  const handleCancel = () => {
    setDialogOpen(false);
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (!editable) {
    return (
      <Avatar className={sizeClasses[size]}>
        <AvatarImage src={image || undefined} alt={`${firstName} ${lastName}`} />
        <AvatarFallback className="bg-slate-100 text-slate-600">
          {initials}
        </AvatarFallback>
      </Avatar>
    );
  }

  return (
    <>
      <div className="relative inline-block group">
        <Avatar className={sizeClasses[size]}>
          <AvatarImage src={image || undefined} alt={`${firstName} ${lastName}`} />
          <AvatarFallback className="bg-slate-100 text-slate-600">
            {initials}
          </AvatarFallback>
        </Avatar>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
        >
          <Camera className="h-5 w-5 text-white" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Dialog de prévisualisation */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier la photo de profil</DialogTitle>
            <DialogDescription>
              Prévisualisation de l'image sélectionnée
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-4">
            {previewImage && (
              <Avatar className="h-32 w-32">
                <AvatarImage src={previewImage} />
              </Avatar>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                "Enregistrer"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
