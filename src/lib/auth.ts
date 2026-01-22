import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/session"; // On importe ta fonction de décryptage

export async function getCurrentUser() {
  const cookieStore = await cookies();
  
  // 1. On récupère le cookie qui s'appelle "session" (défini dans ton session.ts)
  const sessionCookie = cookieStore.get("session");

  if (!sessionCookie || !sessionCookie.value) {
    return null; // Pas de cookie = pas connecté
  }

  // 2. On DÉCRYPTE le cookie pour avoir les infos
  const payload = await decrypt(sessionCookie.value);

  if (!payload || !payload.userId) {
    return null; // Session invalide ou expirée
  }

  // 3. Conversion de l'ID
  // D'après ton fichier session.ts, userId est stocké en string.
  // D'après ton erreur précédente, ta base de données attend aussi une string (ou UUID).
  // Donc on passe la valeur directement.
  const userId = payload.userId as string;

  // NOTE : Si jamais ta base de données utilise des IDs numériques (Serial),
  // décommente la ligne ci-dessous :
  // const userId = parseInt(payload.userId as string);

  // 4. On récupère l'utilisateur complet en base (pour être sûr qu'il existe toujours et avoir son rôle à jour)
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  return user || null;
}