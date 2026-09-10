import { fetchApi } from "@/lib/api";
import { Treatment, Clinic } from "@/lib/types";
import TreatmentsList from "./treatments-list";
import Link from "next/link";

export default async function ClinicCatalogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let clinic: Clinic | null = null;
  let treatments: Treatment[] = [];
  let errorMsg = "";

  try {
    const resClinic = await fetchApi<{ ok: boolean; clinic: Clinic }>(`/api/clinics/${id}`);
    const resTreatments = await fetchApi<{ ok: boolean; treatments: Treatment[] }>(`/api/clinics/${id}/treatments`);
    
    if (resClinic.ok) clinic = resClinic.clinic;
    if (resTreatments.ok) treatments = resTreatments.treatments;
  } catch (err: any) {
    errorMsg = err.message || "Error al cargar el catálogo";
  }

  if (!clinic) {
    return <div className="p-8 text-red-500">Clínica no encontrada. {errorMsg}</div>;
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="text-sm text-muted-foreground mb-1">
            <Link href={`/clinics/${id}`} className="hover:underline">← Volver al Workspace</Link>
          </div>
          <h1 className="text-2xl font-bold">Catálogo de Tratamientos</h1>
          <p className="text-muted-foreground">{clinic.name}</p>
        </div>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded shadow text-sm font-semibold hover:bg-primary/90">
          Nuevo Tratamiento
        </button>
      </div>

      <TreatmentsList clinicId={id} initialTreatments={treatments} />
    </div>
  );
}
