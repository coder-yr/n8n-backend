"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../../lib/api";
import { getUser, logout } from "../../lib/auth";
import { useRouter } from "next/navigation";
import AnalyticsChart from "../../components/AnalyticsChart";

export default function DashboardPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [scheduleTime, setScheduleTime] = useState("09:00");
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  useEffect(() => {
    if (!localStorage.getItem("token")) router.push("/login");
  }, [router]);

  const historyQuery = useQuery({
    queryKey: ["history"],
    queryFn: async () => (await api.get("/api/content/history")).data
  });

  const analyticsQuery = useQuery({
    queryKey: ["analytics"],
    queryFn: async () => (await api.get("/api/analytics")).data
  });

  const runMutation = useMutation({
    mutationFn: async () => (await api.post("/api/content/run")).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["history"] });
      qc.invalidateQueries({ queryKey: ["analytics"] });
    }
  });

  const scheduleMutation = useMutation({
    mutationFn: async () =>
      (await api.post("/api/schedule", { frequency: "daily", time: scheduleTime })).data
  });

  const copyContent = async (item) => {
    const payload = [
      `Date: ${new Date(item.createdAt).toLocaleString()}`,
      "",
      "Hooks:",
      ...(item.hooks || []),
      "",
      "Scripts:",
      ...(item.scripts || []),
      "",
      "Captions:",
      ...(item.captions || []),
      "",
      "Hashtags:",
      (item.hashtags || []).join(" ")
    ].join("\n");
    await navigator.clipboard.writeText(payload);
  };

  const downloadCsv = async () => {
    const response = await api.get("/api/content/export.csv", { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([response.data], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "content-history.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-6">
      <header className="flex items-center justify-between rounded-xl bg-slate-900 p-4">
        <div>
          <h1 className="text-2xl font-semibold">AI Viral Content Engine</h1>
          <p className="text-slate-400">
            {user ? `${user.email} (${user.plan || "free"})` : "Loading account..."}
          </p>
        </div>
        <button
          className="rounded bg-slate-700 px-3 py-2"
          onClick={() => {
            logout();
            router.push("/login");
          }}
        >
          Logout
        </button>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl bg-slate-900 p-4">
          <h2 className="mb-2 text-lg">Run Content Engine</h2>
          <button
            className="w-full rounded bg-indigo-600 p-2 hover:bg-indigo-500"
            onClick={() => runMutation.mutate()}
          >
            {runMutation.isPending ? "Running..." : "Generate Content"}
          </button>
          {runMutation.isError ? (
            <p className="mt-2 text-sm text-red-400">
              {runMutation.error?.response?.data?.message || "Failed to run content engine."}
            </p>
          ) : null}
        </div>

        <div className="rounded-xl bg-slate-900 p-4">
          <h2 className="mb-2 text-lg">Schedule Daily Generation</h2>
          <input
            type="time"
            value={scheduleTime}
            onChange={(e) => setScheduleTime(e.target.value)}
            className="w-full rounded bg-slate-800 p-2"
          />
          <button
            className="mt-2 w-full rounded bg-emerald-600 p-2 hover:bg-emerald-500"
            onClick={() => scheduleMutation.mutate()}
          >
            Save Schedule
          </button>
        </div>

        <div className="rounded-xl bg-slate-900 p-4">
          <h2 className="mb-2 text-lg">Plan Limits</h2>
          <p className="text-slate-300">Free: 5 generations/day</p>
          <p className="text-slate-300">Pro: Unlimited</p>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">Analytics</h2>
        <AnalyticsChart summary={analyticsQuery.data?.summary || {}} />
      </section>

      <section className="rounded-xl bg-slate-900 p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-xl font-semibold">Generated Content History</h2>
          <button className="rounded bg-slate-700 px-3 py-2 text-sm" onClick={downloadCsv}>
            Download CSV
          </button>
        </div>
        {historyQuery.isLoading ? <p className="text-slate-400">Loading history...</p> : null}
        {historyQuery.isError ? (
          <p className="text-red-400">Failed to load history. Please try again.</p>
        ) : null}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-slate-400">
              <tr>
                <th className="p-2">Created</th>
                <th className="p-2">Hooks</th>
                <th className="p-2">Captions</th>
                <th className="p-2">Hashtags</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(historyQuery.data || []).map((item) => (
                <tr key={item._id} className="border-t border-slate-800 align-top">
                  <td className="p-2">{new Date(item.createdAt).toLocaleString()}</td>
                  <td className="p-2">
                    <pre className="whitespace-pre-wrap">{(item.hooks || []).join("\n")}</pre>
                  </td>
                  <td className="p-2">
                    <pre className="whitespace-pre-wrap">{(item.captions || []).join("\n")}</pre>
                  </td>
                  <td className="p-2">
                    <pre className="whitespace-pre-wrap">{(item.hashtags || []).join(" ")}</pre>
                  </td>
                  <td className="p-2">
                    <button
                      className="rounded bg-slate-700 px-2 py-1 text-xs hover:bg-slate-600"
                      onClick={() => copyContent(item)}
                    >
                      Copy
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
