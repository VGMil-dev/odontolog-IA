"use server";

import { fetchApi } from "@/lib/api";
import { revalidatePath } from "next/cache";

export async function toggleDoctorStatus(clinicId: string, doctorId: string) {
  try {
    await fetchApi(`/api/clinics/${clinicId}/doctors/${doctorId}/toggle-status`, { method: "POST" });
    revalidatePath(`/clinics/${clinicId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateTelegramCredentials(clinicId: string, token: string) {
  try {
    await fetchApi(`/api/clinics/${clinicId}/telegram`, {
      method: "POST",
      body: JSON.stringify({ telegramBotToken: token })
    });
    revalidatePath(`/clinics/${clinicId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateMetaCredentials(clinicId: string, phoneId: string, wabaId: string, accessToken: string) {
  try {
    await fetchApi(`/api/clinics/${clinicId}/meta-whatsapp`, {
      method: "POST",
      body: JSON.stringify({ 
        metaPhoneNumberId: phoneId,
        metaWabaId: wabaId,
        metaAccessToken: accessToken
      })
    });
    revalidatePath(`/clinics/${clinicId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
