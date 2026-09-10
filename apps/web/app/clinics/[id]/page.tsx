import { fetchApi } from "@/lib/api";
import { Clinic, Doctor } from "@/lib/types";
import DoctorsList from "./doctors-list";
import Link from "next/link";
import CredentialsModal from "./credentials-modal";

export default async function ClinicWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let clinic: Clinic | null = null;
  let doctors: Doctor[] = [];
  let errorMsg = "";

  try {
    const resClinic = await fetchApi<{ ok: boolean; clinic: Clinic }>(`/api/clinics/${id}`);
    const resDoctors = await fetchApi<{ ok: boolean; doctors: Doctor[] }>(`/api/clinics/${id}/doctors`);
    
    if (resClinic.ok) clinic = resClinic.clinic;
    if (resDoctors.ok) doctors = resDoctors.doctors;
  } catch (err: any) {
    errorMsg = err.message || "Error al cargar el workspace";
  }

  if (!clinic) {
    return <div className="p-8 text-red-500">Clínica no encontrada. {errorMsg}</div>;
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{clinic.name}</h1>
          <p className="text-muted-foreground">{clinic.city} - {clinic.address}</p>
        </div>
        <div className="space-x-2">
          <Link href={`/clinics/${id}/catalog`} className="bg-secondary text-secondary-foreground px-4 py-2 rounded shadow text-sm font-semibold hover:bg-secondary/90">
            Catálogo / Tratamientos
          </Link>
          <CredentialsModal clinic={clinic} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="border rounded-lg p-4 bg-card">
          <div className="text-sm text-muted-foreground">Sillones</div>
          <div className="text-2xl font-bold">{clinic.chairsCount}</div>
        </div>
        <div className="border rounded-lg p-4 bg-card">
          <div className="text-sm text-muted-foreground">Doctores</div>
          <div className="text-2xl font-bold">{doctors.length}</div>
        </div>
        <div className="border rounded-lg p-4 bg-card">
          <div className="text-sm text-muted-foreground">Bot Telegram</div>
          <div className="text-lg font-bold text-primary">{clinic.telegramBotToken ? "Activo" : "No configurado"}</div>
        </div>
        <div className="border rounded-lg p-4 bg-card">
          <div className="text-sm text-muted-foreground">WhatsApp Meta</div>
          <div className="text-lg font-bold text-primary">{clinic.metaPhoneNumberId ? "Activo" : "No configurado"}</div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Personal Médico</h2>
        <DoctorsList clinicId={id} initialDoctors={doctors} />
      </div>
    </div>
  );
}
