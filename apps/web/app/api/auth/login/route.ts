import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: "Faltan credenciales" },
        { status: 400 }
      );
    }

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    
    const res = await fetch(`${backendUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok || !data.ok) {
      return NextResponse.json(
        { ok: false, error: data.error || data.message || "Error de autenticación" },
        { status: res.status !== 200 ? res.status : 401 }
      );
    }

    // Respuesta exitosa
    const response = NextResponse.json({ ok: true, user: data.user, role: data.role, clinicId: data.clinicId });

    // Seteamos la cookie httpOnly
    response.cookies.set({
      name: "session",
      value: data.token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      // Expiración aproximada, el token real expira también. Ponemos 1 día por defecto
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error: any) {
    console.error("Login BFF Error:", error);
    return NextResponse.json(
      { ok: false, error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
