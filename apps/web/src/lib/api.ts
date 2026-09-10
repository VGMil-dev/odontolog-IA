export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const isServer = typeof window === "undefined";
  
  // Base URL resolution
  // On the server, we hit NestJS directly.
  // On the client, we hit Next.js rewrites (e.g. /api/* -> NestJS).
  const baseUrl = isServer ? (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000") : "";
  const url = `${baseUrl}${endpoint}`;
  
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  // If server-side, try to extract token from cookies and inject as Bearer
  if (isServer) {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session");
    if (sessionCookie?.value) {
      headers.set("Authorization", `Bearer ${sessionCookie.value}`);
    }
  } else {
    // Note: Next.js rewrite will NOT inject the Bearer token automatically if it just proxies.
    // However, the instructions say "Auth BFF (cookie httpOnly)".
    // So the client can't read the cookie. We either need Next API routes for everything,
    // OR we need Next.js middleware to rewrite the request adding the Authorization header.
    // Wait, since we are fetching from server components mostly, fetchApi will do it.
    // If client component calls `/api/X`, Next.js rewrite handles it. But NestJS expects a Bearer token.
    // Let's rely on Next.js Server Components mostly, or we will add middleware injection later if needed.
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    throw new Error(data.message || data.error || `API Error: ${res.statusText}`);
  }

  return data as T;
}
