import { fetchApi } from "@/lib/api";
import { Clinic } from "@/lib/types";
import ClinicsTable from "./clinics-table";

export default async function ClinicsPage() {
  let clinics: Clinic[] = [];
  let errorMsg = "";

  try {
    const res = await fetchApi<{ ok: boolean; clinics: Clinic[] }>("/api/clinics");
    if (res.ok) {
      clinics = res.clinics;
    }
  } catch (err: any) {
    errorMsg = err.message || "Error al obtener clínicas";
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Directorio de Clínicas</h1>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded shadow text-sm font-semibold hover:bg-primary/90">
          Nueva Clínica
        </button>
      </div>
      
      {errorMsg ? (
        <div className="text-red-500">{errorMsg}</div>
      ) : (
        <ClinicsTable initialClinics={clinics} />
      )}
    </div>
  );
}