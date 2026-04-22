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
    <div className="min-h-screen">
      <header className="glass-header px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                AI Viral <span className="gradient-text">Content Engine</span>
              </h1>
              <p className="text-xs text-slate-400 font-medium">
                {user ? `${user.email} • ${user.plan || "free"}` : "Loading account..."}
              </p>
            </div>
          </div>
          <button
            className="premium-button rounded-lg bg-white/5 px-4 py-2 text-sm font-medium hover:bg-white/10 border border-white/10"
            onClick={() => {
              logout();
              router.push("/login");
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 p-6">
        <section className="grid gap-6 md:grid-cols-3">
          <div className="glass-card rounded-2xl p-6 shadow-xl transition-all hover:translate-y-[-2px] hover:shadow-indigo-500/10">
            <div className="mb-4 flex items-center gap-3 text-indigo-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h2 className="text-lg font-bold">Generate Content</h2>
            </div>
            <button
              className="premium-button w-full rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 p-3 font-semibold shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40"
              onClick={() => runMutation.mutate()}
            >
              {runMutation.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Running Engine...
                </span>
              ) : "Ignite Viral Engine"}
            </button>
            {runMutation.isError && (
              <p className="mt-3 text-center text-xs text-red-400 font-medium animate-pulse">
                {runMutation.error?.response?.data?.message || "Generation Failed"}
              </p>
            )}
          </div>

          <div className="glass-card rounded-2xl p-6 shadow-xl transition-all hover:translate-y-[-2px] hover:shadow-emerald-500/10">
            <div className="mb-4 flex items-center gap-3 text-emerald-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-lg font-bold">Smart Scheduler</h2>
            </div>
            <div className="space-y-3">
              <input
                type="time"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                className="w-full rounded-xl bg-slate-950/50 border border-slate-800 p-2.5 text-center text-lg font-mono focus:border-emerald-500/50 outline-none transition-colors"
              />
              <button
                className="premium-button w-full rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 p-3 font-semibold hover:bg-emerald-600/30"
                onClick={() => scheduleMutation.mutate()}
              >
                {scheduleMutation.isPending ? "Saving..." : "Set Daily Automation"}
              </button>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 shadow-xl">
            <div className="mb-4 flex items-center gap-3 text-slate-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <h2 className="text-lg font-bold">Usage Credits</h2>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Current Plan</span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold uppercase tracking-wider border border-indigo-500/20">
                  {user?.plan || "Free"}
                </span>
              </div>
              <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 w-1/3 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
              </div>
              <p className="text-[10px] text-slate-500 font-medium">Daily limit resets at midnight UTC</p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-end justify-between px-2">
            <h2 className="text-2xl font-bold tracking-tight">Performance <span className="text-indigo-400">Insights</span></h2>
          </div>
          <div className="glass-card rounded-2xl p-6 shadow-xl">
            <AnalyticsChart summary={analyticsQuery.data?.summary || {}} />
          </div>
        </section>

        <section className="glass-card rounded-2xl overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between p-6 border-b border-slate-800/50">
            <h2 className="text-xl font-bold tracking-tight">Generation <span className="text-indigo-400">Vault</span></h2>
            <button 
              className="premium-button rounded-lg bg-slate-800/50 px-4 py-2 text-sm font-semibold hover:bg-slate-700/50 border border-slate-700/50 flex items-center gap-2"
              onClick={downloadCsv}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export Records
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-separate border-spacing-0">
              <thead>
                <tr className="bg-slate-900/50 text-slate-500 font-bold">
                  <th className="px-6 py-4 border-b border-slate-800/50">Date</th>
                  <th className="px-6 py-4 border-b border-slate-800/50">Hooks & Strategies</th>
                  <th className="px-6 py-4 border-b border-slate-800/50">Creative Copy</th>
                  <th className="px-6 py-4 border-b border-slate-800/50">Growth Tags</th>
                  <th className="px-6 py-4 border-b border-slate-800/50 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {historyQuery.isLoading ? (
                  <tr><td colSpan="5" className="p-12 text-center text-slate-500 font-medium">Analyzing records...</td></tr>
                ) : (historyQuery.data || []).map((item) => (
                  <tr key={item._id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-6 whitespace-nowrap text-xs font-mono text-slate-400">
                      {new Date(item.createdAt).toLocaleDateString()}<br/>
                      {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-6 min-w-[240px]">
                      <div className="space-y-2">
                        {(item.hooks || []).map((hook, i) => (
                          <div key={i} className="flex gap-2">
                            <span className="text-indigo-500/50 font-mono mt-1">#0{i+1}</span>
                            <p className="text-slate-200 leading-relaxed font-medium">{hook}</p>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-6 min-w-[280px]">
                      <div className="space-y-3">
                        {(item.scripts || []).map((script, i) => (
                          <p key={i} className="text-slate-400 leading-relaxed text-xs border-l-2 border-indigo-500/20 pl-3">{script}</p>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-6 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                        {(item.hashtags || []).map((tag, i) => (
                          <span key={i} className="text-[10px] font-bold text-indigo-400/80 bg-indigo-500/5 px-2 py-0.5 rounded border border-indigo-500/10 uppercase tracking-tighter">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <button
                        className="premium-button opacity-0 group-hover:opacity-100 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500"
                        onClick={() => copyContent(item)}
                      >
                        Copy All
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {(!historyQuery.isLoading && (historyQuery.data || []).length === 0) && (
            <div className="p-12 text-center">
              <p className="text-slate-500 font-medium">Your generation vault is empty. Ignite the engine to begin.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
