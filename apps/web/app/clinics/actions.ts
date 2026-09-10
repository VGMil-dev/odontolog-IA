"use server";

import { fetchApi } from "@/lib/api";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function impersonateClinic(targetClinicId: string) {
  try {
    const data = await fetchApi<{ ok: boolean; token?: string; error?: string }>("/api/auth/impersonate", {
      method: "POST",
      body: JSON.stringify({ targetClinicId }),
    });

    if (data.ok && data.token) {
      const cookieStore = await cookies();
      cookieStore.set("session-impersonated", data.token, {
        httpOnly: true,
        path: "/",
        sameSite: "lax",
      });
      return { success: true };
    } else {
      return { success: false, error: data.error || "Impersonation failed" };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteClinic(id: string) {
  try {
    await fetchApi(`/api/clinics/${id}`, { method: "DELETE" });
    revalidatePath("/clinics");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function stopImpersonating() {
  const cookieStore = await cookies();
  cookieStore.delete("session-impersonated");
  return { success: true };
}
