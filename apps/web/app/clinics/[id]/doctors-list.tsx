"use client";

import { Doctor } from "@/lib/types";
import { toggleDoctorStatus } from "./actions";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DoctorsList({ clinicId, initialDoctors }: { clinicId: string, initialDoctors: Doctor[] }) {
  const [doctors, setDoctors] = useState(initialDoctors);
  const router = useRouter();

  const handleToggle = async (doctorId: string) => {
    const res = await toggleDoctorStatus(clinicId, doctorId);
    if (res.success) {
      setDoctors(docs => docs.map(d => d.id === doctorId ? { ...d, isActive: !d.isActive } : d));
      router.refresh();
    } else {
      alert("Error: " + res.error);
    }
  };

  if (doctors.length === 0) {
    return <p className="text-muted-foreground mt-4">No hay doctores registrados.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-border">
        <thead className="bg-muted">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Nombre</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Especialidad</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Estado</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase">Acciones</th>
          </tr>
        </thead>
        <tbody className="bg-card">
          {doctors.map(doc => (
            <tr key={doc.id} className="border-b">
              <td className="px-4 py-2 font-medium">{doc.name}</td>
              <td className="px-4 py-2">{doc.specialtyLabel || doc.specialty || "-"}</td>
              <td className="px-4 py-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${doc.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                  {doc.isActive ? "Activo" : "Inactivo"}
                </span>
              </td>
              <td className="px-4 py-2">
                <button 
                  onClick={() => handleToggle(doc.id)}
                  className="text-primary hover:underline text-sm font-semibold"
                >
                  Cambiar Estado
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
