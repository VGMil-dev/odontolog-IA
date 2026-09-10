import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const session = request.cookies.get("session");
  const { pathname } = request.nextUrl;

  const isProtectedRoute = pathname.startsWith("/dashboard") || pathname.startsWith("/clinics");
  const isAuthRoute = pathname.startsWith("/login");

  if (isProtectedRoute && !session?.value) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Redirigir si está autenticado e intenta ir a login
  if (isAuthRoute && session?.value) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard"; // o a /clinics dependiendo del rol, pero /dashboard por defecto
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/clinics/:path*",
    "/login",
  ],
};
