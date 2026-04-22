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

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email.trim()) {
      setError("Email is required");
      return;
    }
    if (!form.password || form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

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
        return;
      }
      setError(err.response?.data?.message || "Authentication failed");
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-xl bg-slate-900 p-6 shadow-lg">
      <h1 className="text-2xl font-semibold">{mode === "signup" ? "Create Account" : "Login"}</h1>
      <input
        className="w-full rounded bg-slate-800 p-2"
        placeholder="Email"
        type="email"
        required
        value={form.email}
        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
      />
      <input
        className="w-full rounded bg-slate-800 p-2"
        placeholder="Password"
        type="password"
        required
        minLength={6}
        value={form.password}
        onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
      />
      {mode === "signup" && (
        <>
          <input
            className="w-full rounded bg-slate-800 p-2"
            placeholder="Niche"
            value={form.niche}
            onChange={(e) => setForm((f) => ({ ...f, niche: e.target.value }))}
          />
          <input
            className="w-full rounded bg-slate-800 p-2"
            placeholder="Tone"
            value={form.tone}
            onChange={(e) => setForm((f) => ({ ...f, tone: e.target.value }))}
          />
        </>
      )}
      {error ? <p className="text-red-400">{error}</p> : null}
      <button className="w-full rounded bg-indigo-600 p-2 hover:bg-indigo-500" type="submit">
        {mode === "signup" ? "Sign up" : "Login"}
      </button>
    </form>
  );
}
