import { fetchApi } from "@/lib/api";
import { Metrics } from "@/lib/types";
import ChannelChart from "./channel-chart";

export default async function DashboardPage() {
  let metrics: Metrics | null = null;
  let errorMsg = "";

  try {
    const res = await fetchApi<{ ok: boolean; metrics: Metrics }>("/api/metrics/real");
    if (res.ok) {
      metrics = res.metrics;
    }
  } catch (err: any) {
    errorMsg = err.message || "Error al obtener métricas";
  }

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      
      {errorMsg && <div className="text-red-500">{errorMsg}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border rounded-lg p-4 bg-card text-card-foreground">
          <div className="text-sm text-muted-foreground">Clínicas Activas</div>
          <div className="text-2xl font-bold">{metrics?.activeClinics ?? 0}</div>
        </div>
        
        <div className="border rounded-lg p-4 bg-card text-card-foreground">
          <div className="text-sm text-muted-foreground">MRR</div>
          <div className="text-2xl font-bold">${metrics?.mrr?.toLocaleString() ?? 0}</div>
        </div>
        
        <div className="border rounded-lg p-4 bg-card text-card-foreground">
          <div className="text-sm text-muted-foreground">Citas Totales</div>
          <div className="text-2xl font-bold">{metrics?.totalAppointments ?? 0}</div>
        </div>
      </div>

      {metrics?.channels && (
        <ChannelChart data={metrics.channels} />
      )}
    </div>
  );
}