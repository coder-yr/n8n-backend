"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function AnalyticsChart({ summary }) {
  const data = [
    { metric: "Likes", value: summary?.likes || 0 },
    { metric: "Views", value: summary?.views || 0 },
    { metric: "Shares", value: summary?.shares || 0 },
    { metric: "Comments", value: summary?.comments || 0 }
  ];

  return (
    <div className="h-64 w-full rounded-xl bg-slate-900 p-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="metric" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip />
          <Bar dataKey="value" fill="#6366f1" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
