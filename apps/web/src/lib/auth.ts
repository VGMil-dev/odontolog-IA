import { cookies } from "next/headers";
import { fetchApi } from "./api";

export type UserSession = {
  email: string;
  role: string;
  clinicId: string | null;
  iat?: number;
  exp?: number;
};

export async function getSession(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");
  
  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  try {
    // Verificar token contra el backend
    // Usamos fetchApi, que en SSR automáticamente inyectará la cookie 'session'
    // como Bearer token.
    const res = await fetchApi<{ ok: boolean; user: UserSession }>("/api/auth/verify");
    
    if (res.ok && res.user) {
      return res.user;
    }
    
    return null;
  } catch (error) {
    console.error("Session verification failed:", error);
    return null;
  }
}

export async function getToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");
  return sessionCookie?.value || null;
}
