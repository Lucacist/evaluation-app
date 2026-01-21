import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "@/lib/session";
import { cookies } from "next/headers";

// Routes protégées
const protectedRoutes = ["/dashboard"];
// Routes publiques (login, inscription)
const publicRoutes = ["/"];

export default async function middleware(req: NextRequest) {
  // 1. Vérifier si l'utilisateur est connecté
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some((route) => path.startsWith(route));
  const isPublicRoute = publicRoutes.includes(path);

  const cookie = (await cookies()).get("session")?.value;
  const session = await decrypt(cookie);

  // 2. Redirections
  
  // Cas A : Il essaie d'accéder au dashboard sans être connecté -> Hop, Login
  if (isProtectedRoute && !session?.userId) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  // Cas B : Il est déjà connecté et va sur le Login -> Hop, Dashboard
  if (isPublicRoute && session?.userId) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  return NextResponse.next();
}

// Configuration : sur quelles routes le middleware s'active
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};