"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface ChannelChartProps {
  data: { name: string; count: number }[];
}

export default function ChannelChart({ data }: ChannelChartProps) {
  if (!data || data.length === 0) {
    return <div className="text-muted-foreground text-sm mt-8">Sin datos de canales</div>;
  }
  return (
    <div className="h-64 w-full mt-8">
      <h3 className="text-lg font-bold mb-4">Interacciones por Canal</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#D2B48C" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
