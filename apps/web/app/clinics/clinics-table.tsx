"use client";

import { useState } from "react";
import { Clinic } from "@/lib/types";
import { impersonateClinic, deleteClinic } from "./actions";
import { useRouter } from "next/navigation";

export default function ClinicsTable({ initialClinics }: { initialClinics: Clinic[] }) {
  const [clinics, setClinics] = useState<Clinic[]>(initialClinics);
  const router = useRouter();

  const handleImpersonate = async (id: string) => {
    const res = await impersonateClinic(id);
    if (res.success) {
      router.push(`/clinics/${id}`);
    } else {
      alert("Error: " + res.error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta clínica?")) return;
    const res = await deleteClinic(id);
    if (res.success) {
      setClinics(clinics.filter(c => c.id !== id));
    } else {
      alert("Error al eliminar: " + res.error);
    }
  };

  if (clinics.length === 0) {
    return <p className="text-muted-foreground">No hay clínicas registradas.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-border">
        <thead className="bg-muted">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Nombre</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Estado</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Sillones</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Acciones</th>
          </tr>
        </thead>
        <tbody className="bg-card">
          {clinics.map((clinic) => (
            <tr key={clinic.id} className="border-b">
              <td className="px-4 py-2 font-medium">{clinic.name}</td>
              <td className="px-4 py-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Activo
                </span>
              </td>
              <td className="px-4 py-2">{clinic.chairsCount}</td>
              <td className="px-4 py-2 space-x-4">
                <button 
                  className="text-primary hover:underline text-sm font-semibold"
                  onClick={() => handleImpersonate(clinic.id)}
                >
                  Ver como Clínica
                </button>
                <button 
                  className="text-red-500 hover:underline text-sm font-semibold"
                  onClick={() => handleDelete(clinic.id)}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
