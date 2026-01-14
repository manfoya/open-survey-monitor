import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { DEFAULT_LOGIN_REDIRECT } from "./lib/routes";

const LOGIN_REQUIRED_PATHS = ["/overview", "/users"];

// Middleware pour gérer la redirection en fonction de l'état d'authentification

export function proxy(request: NextRequest) {
  const token = request.cookies.get("access_token");
  const isLoginPage = request.nextUrl.pathname === "/login";

  // Utilisateur connecté qui essaie d'aller sur /login
  if (token && isLoginPage) {
    return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, request.url));
  }

  //  Utilisateur NON connecté qui essaie d'aller sur le dashboard
  // Etendre cette logique à d'autres routes protégées si besoin
  if (
    !token &&
    LOGIN_REQUIRED_PATHS.some((path) =>
      request.nextUrl.pathname.startsWith(path),
    )
  ) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    loginUrl.searchParams.set("sessionExpired", "true");
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// On définit sur quelles routes le middleware doit s'activer
export const config = {
  matcher: ["/overview/:path*", "/login", "/users/:path*"],
};
