"use client";

import { useState } from "react";
import api from "../lib/api";
import { saveAuth } from "../lib/auth";
import { useRouter } from "next/navigation";

export default function AuthForm({ mode = "login" }) {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
    niche: "general",
    tone: "professional"
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = mode === "signup" ? "/api/auth/signup" : "/api/auth/login";
      const payload = mode === "signup" ? form : { email: form.email, password: form.password };
      const { data } = await api.post(endpoint, payload);
      saveAuth(data);
      router.push("/dashboard");
    } catch (err) {
      const issues = err.response?.data?.issues;
      if (Array.isArray(issues) && issues.length) {
        setError(issues.map((issue) => issue.message).join(", "));
      } else {
        setError(err.response?.data?.message || "Authentication failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card rounded-2xl p-8 shadow-2xl border border-white/10">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          {mode === "signup" ? "Get Started" : "Welcome Back"}
        </h1>
        <p className="text-slate-400 text-sm">
          {mode === "signup" ? "Join the AI viral revolution" : "Log in to your command center"}
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
          <input
            className="w-full rounded-xl bg-slate-950/50 border border-slate-800 p-3 focus:border-indigo-500/50 outline-none transition-colors text-sm"
            placeholder="name@company.com"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Password</label>
          <input
            className="w-full rounded-xl bg-slate-950/50 border border-slate-800 p-3 focus:border-indigo-500/50 outline-none transition-colors text-sm"
            placeholder="••••••••"
            type="password"
            required
            minLength={6}
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          />
        </div>

        {mode === "signup" && (
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Niche</label>
              <input
                className="w-full rounded-xl bg-slate-950/50 border border-slate-800 p-3 focus:border-indigo-500/50 outline-none transition-colors text-sm"
                placeholder="e.g. Fintech"
                value={form.niche}
                onChange={(e) => setForm((f) => ({ ...f, niche: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Tone</label>
              <input
                className="w-full rounded-xl bg-slate-950/50 border border-slate-800 p-3 focus:border-indigo-500/50 outline-none transition-colors text-sm"
                placeholder="e.g. Witty"
                value={form.tone}
                onChange={(e) => setForm((f) => ({ ...f, tone: e.target.value }))}
              />
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            <p className="text-red-400 text-xs font-medium text-center">{error}</p>
          </div>
        )}

        <button 
          className="premium-button w-full rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 p-3.5 font-bold shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 text-sm mt-4" 
          type="submit"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Authenticating...
            </span>
          ) : (mode === "signup" ? "Create Free Account" : "Access Engine")}
        </button>
      </form>
    </div>
  );
}
