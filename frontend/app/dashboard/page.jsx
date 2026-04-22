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
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard, settings
  const [toast, setToast] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  useEffect(() => {
    if (!localStorage.getItem("token")) router.push("/login");
  }, [router]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

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
      showToast("Viral Engine ignited successfully!");
    },
    onError: (err) => {
      showToast(err.response?.data?.message || "Generation Failed", "error");
    }
  });

  const settingsMutation = useMutation({
    mutationFn: async (settings) => (await api.put("/api/user/settings", settings)).data,
    onSuccess: (data) => {
      const updatedUser = { ...user, niche: data.user.niche, tone: data.user.tone };
      setUser(updatedUser);
      import("../../lib/auth").then(m => m.updateUser(updatedUser));
      showToast("Preferences saved!");
    }
  });

  const scheduleMutation = useMutation({
    mutationFn: async () =>
      (await api.post("/api/schedule", { frequency: "daily", time: scheduleTime })).data,
    onSuccess: () => showToast("Schedule updated!")
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
    setCopiedId(item._id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen text-slate-200">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300 ${
          toast.type === "error" ? "bg-red-500/20 border-red-500/50 text-red-200" : "bg-indigo-500/20 border-indigo-500/50 text-indigo-200"
        }`}>
          <div className={`w-2 h-2 rounded-full animate-pulse ${toast.type === "error" ? "bg-red-400" : "bg-indigo-400"}`} />
          <span className="text-sm font-semibold tracking-wide">{toast.message}</span>
        </div>
      )}

      <header className="glass-header sticky top-0 z-40 px-6 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setActiveTab("dashboard")}>
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold tracking-tight hidden sm:block">
                Viral <span className="gradient-text">Engine</span>
              </h1>
            </div>
            
            <nav className="flex gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
              <button 
                onClick={() => setActiveTab("dashboard")}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${activeTab === "dashboard" ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" : "text-slate-400 hover:text-white"}`}
              >
                Dashboard
              </button>
              <button 
                onClick={() => setActiveTab("settings")}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${activeTab === "settings" ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" : "text-slate-400 hover:text-white"}`}
              >
                Settings
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:block text-right">
              <p className="text-xs font-bold text-white leading-none">{user?.email?.split('@')[0]}</p>
              <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mt-1">{user?.plan || "free tier"}</p>
            </div>
            <button
              className="premium-button rounded-lg bg-white/5 p-2 text-slate-400 hover:text-white hover:bg-white/10 border border-white/10 transition-colors"
              onClick={() => { logout(); router.push("/login"); }}
              title="Logout"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 p-6 pb-24">
        {activeTab === "settings" ? (
          <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-black tracking-tight">System <span className="text-indigo-400">Preferences</span></h2>
            <p className="text-slate-400">Tailor the AI engine to your specific audience and brand voice.</p>
            
            <div className="grid gap-6">
              <div className="glass-card rounded-2xl p-8 border border-white/10">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" /> Target Niche
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {["Developer", "Startup", "Marketing", "Fitness", "Gaming", "General"].map(n => (
                    <button
                      key={n}
                      onClick={() => settingsMutation.mutate({ niche: n.toLowerCase(), tone: user?.tone })}
                      className={`p-4 rounded-xl border text-sm font-bold transition-all ${user?.niche?.toLowerCase() === n.toLowerCase() ? "bg-indigo-500 border-indigo-400 shadow-lg shadow-indigo-500/20" : "bg-white/5 border-white/10 hover:border-white/20"}`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div className="glass-card rounded-2xl p-8 border border-white/10">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500" /> Brand Tone
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {["Professional", "Bold", "Witty", "Educational", "Direct", "Inspirational"].map(t => (
                    <button
                      key={t}
                      onClick={() => settingsMutation.mutate({ niche: user?.niche, tone: t.toLowerCase() })}
                      className={`p-4 rounded-xl border text-sm font-bold transition-all ${user?.tone?.toLowerCase() === t.toLowerCase() ? "bg-purple-500 border-purple-400 shadow-lg shadow-purple-500/20" : "bg-white/5 border-white/10 hover:border-white/20"}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-500">
            <section className="grid gap-6 md:grid-cols-3">
              <div className="glass-card rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <div className="mb-4 flex items-center gap-3 text-indigo-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  <h2 className="text-lg font-bold">Smart Engine</h2>
                </div>
                <p className="text-xs text-slate-500 mb-6">Current: {user?.niche} • {user?.tone}</p>
                <button
                  disabled={runMutation.isPending}
                  className="premium-button w-full rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 p-4 font-bold shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 disabled:opacity-50"
                  onClick={() => runMutation.mutate()}
                >
                  {runMutation.isPending ? "Analyzing & Generating..." : "Ignite Viral Engine"}
                </button>
              </div>

              <div className="glass-card rounded-2xl p-6 shadow-xl group">
                <div className="mb-4 flex items-center gap-3 text-emerald-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <h2 className="text-lg font-bold">Auto-Schedule</h2>
                </div>
                <div className="space-y-4">
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full rounded-xl bg-slate-950/50 border border-slate-800 p-3 text-center text-xl font-mono focus:border-emerald-500/50 outline-none transition-colors"
                  />
                  <button
                    className="premium-button w-full rounded-xl bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 p-3 text-sm font-bold hover:bg-emerald-600/20 transition-all"
                    onClick={() => scheduleMutation.mutate()}
                  >
                    {scheduleMutation.isPending ? "Updating..." : "Save Schedule"}
                  </button>
                </div>
              </div>

              <div className="glass-card rounded-2xl p-6 shadow-xl">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-amber-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    <h2 className="text-lg font-bold">Credits</h2>
                  </div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Active</span>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <p className="text-3xl font-black">Unlimited</p>
                    <p className="text-xs font-bold text-indigo-400 pb-1">Pro Access</p>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-amber-500 to-amber-300 w-full animate-pulse" />
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-end justify-between px-2">
                <h2 className="text-2xl font-black tracking-tight uppercase">Performance <span className="text-indigo-400">Matrix</span></h2>
              </div>
              <div className="glass-card rounded-3xl p-8 shadow-2xl border border-white/5">
                <AnalyticsChart summary={analyticsQuery.data?.summary || {}} />
              </div>
            </section>

            <section className="glass-card rounded-3xl overflow-hidden shadow-2xl border border-white/5">
              <div className="flex items-center justify-between p-8 bg-white/[0.01]">
                <div>
                  <h2 className="text-2xl font-black tracking-tight uppercase">Generation <span className="text-indigo-400">Vault</span></h2>
                  <p className="text-xs text-slate-500 font-bold mt-1">Your high-performing content history</p>
                </div>
                <button 
                  disabled={historyQuery.isLoading}
                  className="premium-button rounded-xl bg-white/5 px-5 py-2.5 text-xs font-black uppercase tracking-widest hover:bg-white/10 border border-white/10 flex items-center gap-3 transition-all"
                  onClick={(e) => { e.stopPropagation(); import("../../lib/api").then(api => api.default.get("/api/content/export.csv", { responseType: "blob" }).then(res => {
                    const url = window.URL.createObjectURL(new Blob([res.data], { type: "text/csv" }));
                    const link = document.createElement("a");
                    link.href = url; link.download = "history.csv";
                    document.body.appendChild(link); link.click(); link.remove();
                  }))}}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Export CSV
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-separate border-spacing-0">
                  <thead>
                    <tr className="bg-white/[0.02] text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
                      <th className="px-8 py-5 border-y border-white/5">Timestamp</th>
                      <th className="px-8 py-5 border-y border-white/5">Viral Hooks</th>
                      <th className="px-8 py-5 border-y border-white/5">Creative Copy</th>
                      <th className="px-8 py-5 border-y border-white/5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {historyQuery.isLoading ? (
                      [1,2,3].map(i => (
                        <tr key={i} className="animate-pulse">
                          <td className="px-8 py-8"><div className="h-4 w-24 bg-white/5 rounded" /></td>
                          <td className="px-8 py-8"><div className="space-y-2"><div className="h-4 w-full bg-white/5 rounded" /><div className="h-4 w-4/5 bg-white/5 rounded" /></div></td>
                          <td className="px-8 py-8"><div className="h-20 w-full bg-white/5 rounded" /></td>
                          <td className="px-8 py-8 text-right"><div className="h-8 w-20 bg-white/5 rounded ml-auto" /></td>
                        </tr>
                      ))
                    ) : (historyQuery.data || []).map((item) => (
                      <tr key={item._id} className="hover:bg-white/[0.03] transition-colors group">
                        <td className="px-8 py-8 whitespace-nowrap align-top">
                          <div className="text-xs font-black text-white">{new Date(item.createdAt).toLocaleDateString()}</div>
                          <div className="text-[10px] text-slate-500 font-bold mt-1 uppercase">{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        </td>
                        <td className="px-8 py-8 min-w-[300px]">
                          <div className="space-y-4">
                            {(item.hooks || []).slice(0, 3).map((hook, i) => (
                              <div key={i} className="flex gap-4 group/hook">
                                <span className="text-indigo-500/40 font-black text-[10px] mt-1">0{i+1}</span>
                                <p className="text-sm text-slate-200 leading-relaxed font-bold group-hover/hook:text-white transition-colors">{hook}</p>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-8 py-8 min-w-[320px] max-w-[400px]">
                          <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all duration-300">
                            {item.captions?.[0] || item.scripts?.[0]}
                          </p>
                          <div className="flex flex-wrap gap-2 mt-4">
                            {(item.hashtags || []).slice(0, 4).map((tag, i) => (
                              <span key={i} className="text-[9px] font-black text-indigo-400/60 uppercase tracking-widest">{tag}</span>
                            ))}
                          </div>
                        </td>
                        <td className="px-8 py-8 text-right align-top">
                          <button
                            className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
                              copiedId === item._id 
                                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                                : "bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600 hover:text-white border border-indigo-500/20"
                            }`}
                            onClick={() => copyContent(item)}
                          >
                            {copiedId === item._id ? "Copied!" : "Copy Bundle"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
