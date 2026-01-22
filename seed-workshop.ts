import { db } from "@/db";
import { tps, vehicles } from "@/db/schema";

// Liste des véhicules (basée sur ton image)
const vehiculesList = [
  "207 Grise", "207 Bleue", "C3 Pluriel", "C3 Grise", "Fiat Punto", 
  "Polo 9N", "Kia Rio", "Kia Soul", "307", "206 CC", "Horizon", 
  "Banc Moteur", "Elément Déposé", "Poste Responsable", "Véhicule Extérieur"
];

// Liste des TPs complète (extraite de tes images)
const tpsList = [
  // --- JAUNE (MOTEUR / DIAGNOSTIC) ---
  { title: "TP Bas Moteur", category: "Moteur", color: "bg-yellow-100 text-yellow-800" },
  { title: "TP Haut Moteur", category: "Moteur", color: "bg-yellow-100 text-yellow-800" },
  { title: "TP Distribution", category: "Moteur", color: "bg-yellow-100 text-yellow-800" },
  { title: "TP Mesure Moteur", category: "Moteur", color: "bg-yellow-100 text-yellow-800" },
  { title: "TP Soupapes", category: "Moteur", color: "bg-yellow-100 text-yellow-800" },
  { title: "TP Culasse", category: "Moteur", color: "bg-yellow-100 text-yellow-800" },
  { title: "TP Segmentation", category: "Moteur", color: "bg-yellow-100 text-yellow-800" },
  { title: "Prise de compression / étanchéité", category: "Moteur", color: "bg-yellow-100 text-yellow-800" },
  { title: "Diag Mécanique", category: "Diagnostic", color: "bg-yellow-100 text-yellow-800" },
  { title: "Recherche schématique injection", category: "Diagnostic", color: "bg-yellow-100 text-yellow-800" },
  { title: "Paramètres injection", category: "Diagnostic", color: "bg-yellow-100 text-yellow-800" },
  { title: "Contrôle débit de fuite injecteur", category: "Diagnostic", color: "bg-yellow-100 text-yellow-800" },
  { title: "Découverte valise de diag", category: "Diagnostic", color: "bg-yellow-100 text-yellow-800" },
  { title: "Paramétrage éléments", category: "Diagnostic", color: "bg-yellow-100 text-yellow-800" },
  { title: "Panne injection", category: "Diagnostic", color: "bg-yellow-100 text-yellow-800" },
  { title: "Recherche panne système annexe", category: "Diagnostic", color: "bg-yellow-100 text-yellow-800" },
  { title: "Prise d'air - ratés moteur", category: "Diagnostic", color: "bg-yellow-100 text-yellow-800" },
  { title: "Remplacement et codage injecteur", category: "Diagnostic", color: "bg-yellow-100 text-yellow-800" },
  { title: "Codage boitier papillon", category: "Diagnostic", color: "bg-yellow-100 text-yellow-800" },
  { title: "Practice diag", category: "Diagnostic", color: "bg-yellow-100 text-yellow-800" },
  { title: "Codage vanne EGR", category: "Diagnostic", color: "bg-yellow-100 text-yellow-800" },
  { title: "Maquette éclairage", category: "Diagnostic", color: "bg-yellow-100 text-yellow-800" },
  { title: "Devis & Facture", category: "Gestion", color: "bg-yellow-100 text-yellow-800" },

  // --- BLEU (TRANSMISSION / ÉLEC / CLIM / CARROSSERIE) ---
  { title: "Distribution - moteur déposé", category: "Moteur", color: "bg-blue-100 text-blue-800" },
  { title: "Distribution - sur véhicule", category: "Moteur", color: "bg-blue-100 text-blue-800" },
  { title: "Remplacement pipe d'admission", category: "Moteur", color: "bg-blue-100 text-blue-800" },
  { title: "Dépose GMP", category: "Moteur", color: "bg-blue-100 text-blue-800" },
  { title: "Remplacement turbo", category: "Moteur", color: "bg-blue-100 text-blue-800" },
  { title: "Pré CT", category: "Contrôle", color: "bg-blue-100 text-blue-800" },
  { title: "Remplacement embrayage", category: "Transmission", color: "bg-blue-100 text-blue-800" },
  { title: "Remplacement pont duster", category: "Transmission", color: "bg-blue-100 text-blue-800" },
  { title: "Remise en état BV à l'établi", category: "Transmission", color: "bg-blue-100 text-blue-800" },
  { title: "Remplacement cardan + vidange BV", category: "Transmission", color: "bg-blue-100 text-blue-800" },
  { title: "Remplacement émetteur / récepteur", category: "Transmission", color: "bg-blue-100 text-blue-800" },
  { title: "Dépose éléments circuit refroidissement", category: "Thermique", color: "bg-blue-100 text-blue-800" },
  { title: "Contrôle étanchéité circuit refroidissement", category: "Thermique", color: "bg-blue-100 text-blue-800" },
  { title: "Remplacement et contrôle calorstat", category: "Thermique", color: "bg-blue-100 text-blue-800" },
  { title: "Remplacement moyeu de roue", category: "Liaison au sol", color: "bg-blue-100 text-blue-800" },
  { title: "Remplacement ou contrôle alternateur", category: "Électricité", color: "bg-blue-100 text-blue-800" },
  { title: "Remplacement ou contrôle démarreur", category: "Électricité", color: "bg-blue-100 text-blue-800" },
  { title: "Démontage et contrôle comp de clim", category: "Climatisation", color: "bg-blue-100 text-blue-800" },
  { title: "Démontage élément divers", category: "Divers", color: "bg-blue-100 text-blue-800" },
  { title: "Remplacement équipement électrique", category: "Électricité", color: "bg-blue-100 text-blue-800" },
  { title: "Remplacement assise de siège", category: "Carrosserie", color: "bg-blue-100 text-blue-800" },
  { title: "Remplacement crémaillère de lève vitre", category: "Carrosserie", color: "bg-blue-100 text-blue-800" },
  { title: "Remplacement serrure de porte", category: "Carrosserie", color: "bg-blue-100 text-blue-800" },
  { title: "Remplacement phares", category: "Carrosserie", color: "bg-blue-100 text-blue-800" },

  // --- VERT (LIAISON AU SOL / FREINAGE / ENTRETIEN) ---
  { title: "Entretien périodique", category: "Entretien", color: "bg-green-100 text-green-800" },
  { title: "Purge circuit de refroidissement", category: "Thermique", color: "bg-green-100 text-green-800" },
  { title: "Dépose amortisseurs", category: "Liaison au sol", color: "bg-green-100 text-green-800" },
  { title: "Réparation crevaison", category: "Liaison au sol", color: "bg-green-100 text-green-800" },
  { title: "Remplacement pneumatiques", category: "Liaison au sol", color: "bg-green-100 text-green-800" },
  { title: "Remplacement crémaillère de direction", category: "Direction", color: "bg-green-100 text-green-800" },
  { title: "Remplacement colonne de direction", category: "Direction", color: "bg-green-100 text-green-800" },
  { title: "Réglage géométrie", category: "Direction", color: "bg-green-100 text-green-800" },
  { title: "Remplacement rotules", category: "Direction", color: "bg-green-100 text-green-800" },
  { title: "Remplacement train arrière", category: "Liaison au sol", color: "bg-green-100 text-green-800" },
  { title: "Remplacement triangle suspension", category: "Liaison au sol", color: "bg-green-100 text-green-800" },
  { title: "Contrôle système de freinage", category: "Freinage", color: "bg-green-100 text-green-800" },
  { title: "Remplacement freins avant", category: "Freinage", color: "bg-green-100 text-green-800" },
  { title: "Remplacement freins arrière", category: "Freinage", color: "bg-green-100 text-green-800" },
  { title: "Remplacement tambour arrière", category: "Freinage", color: "bg-green-100 text-green-800" },
  { title: "Remplacement maitre cylindre", category: "Freinage", color: "bg-green-100 text-green-800" },
  { title: "Remplacement flexible freins avant", category: "Freinage", color: "bg-green-100 text-green-800" },
  { title: "Purge circuit de freinage", category: "Freinage", color: "bg-green-100 text-green-800" },
];

async function main() {
  console.log("🌱 Seeding Workshop Data...");

  // 1. Véhicules
  for (const v of vehiculesList) {
    await db.insert(vehicles).values({ name: v }).onConflictDoNothing();
  }

  // 2. TPs
  for (const t of tpsList) {
    await db.insert(tps).values({ 
      title: t.title, 
      category: t.category, 
      color: t.color 
    }).onConflictDoNothing();
  }

  console.log("✅ Done!");
  process.exit(0);
}

main();