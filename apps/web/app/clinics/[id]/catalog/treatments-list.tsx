"use client";

import { Treatment } from "@/lib/types";
import { deleteTreatment } from "./actions";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TreatmentsList({ clinicId, initialTreatments }: { clinicId: string, initialTreatments: Treatment[] }) {
  const [treatments, setTreatments] = useState(initialTreatments);
  const [search, setSearch] = useState("");
  const router = useRouter();

  const handleDelete = async (treatmentId: string) => {
    if (!confirm("¿Eliminar este tratamiento?")) return;
    const res = await deleteTreatment(clinicId, treatmentId);
    if (res.success) {
      setTreatments(ts => ts.filter(t => t.id !== treatmentId));
      router.refresh();
    } else {
      alert("Error: " + res.error);
    }
  };

  const filtered = treatments.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || (t.specialty && t.specialty.toLowerCase().includes(search.toLowerCase())));

  return (
    <div className="space-y-4">
      <input 
        type="text"
        placeholder="Buscar tratamientos..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full md:w-1/3 p-2 border rounded bg-background"
      />

      {filtered.length === 0 ? (
        <p className="text-muted-foreground mt-4">No se encontraron tratamientos.</p>
      ) : (
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Tratamiento</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Especialidad</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Rango de Precio</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {filtered.map(t => (
                <tr key={t.id}>
                  <td className="px-4 py-2 font-medium">{t.name}</td>
                  <td className="px-4 py-2">{t.specialty || "-"}</td>
                  <td className="px-4 py-2 font-mono text-sm">{t.priceRange || "-"}</td>
                  <td className="px-4 py-2 space-x-4">
                    <button className="text-primary hover:underline text-sm font-semibold">Editar</button>
                    <button 
                      onClick={() => handleDelete(t.id)}
                      className="text-red-500 hover:underline text-sm font-semibold"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
