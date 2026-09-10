"use server";

import { fetchApi } from "@/lib/api";
import { revalidatePath } from "next/cache";

export async function deleteTreatment(clinicId: string, treatmentId: string) {
  try {
    await fetchApi(`/api/clinics/${clinicId}/treatments/${treatmentId}`, { method: "DELETE" });
    revalidatePath(`/clinics/${clinicId}/catalog`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
