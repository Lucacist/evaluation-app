"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSession } from "@/lib/session";
import { deleteSession } from "@/lib/session"; // Assure-toi que cette fonction est exportée depuis lib/session


const loginSchema = z.object({
  email: z.string().email("Format d'email invalide"),
  password: z.string().min(1, "Mot de passe requis"),
});

export async function loginAction(prevState: any, formData: FormData) {
  const data = Object.fromEntries(formData);
  const parsed = loginSchema.safeParse(data);

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { email, password } = parsed.data;

  // 1. Récupération de l'utilisateur
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user) {
    return { error: "Identifiants incorrects." };
  }

  // 2. Vérification DIRECTE (En clair)
  if (user.password !== password) {
    return { error: "Identifiants incorrects." };
  }

  // 3. Création de la Session
  await createSession(user.id, user.role || "teacher");

  // 4. Redirection
  redirect("/dashboard");
}

export async function logoutAction() {
  await deleteSession();
  redirect("/");
}