"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { UserPlus } from "lucide-react";

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({ email: "", name: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form.email, form.name, form.password);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2 className="text-xl font-bold text-content mb-1">Create account</h2>
      <p className="text-content-3 text-sm mb-5">Start your financial journey</p>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 rounded-xl border border-red-500/20 text-sm text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-content-2 mb-1.5">Full Name</label>
          <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="input" placeholder="Rahul Sharma" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-content-2 mb-1.5">Email</label>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="input" placeholder="you@example.com" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-content-2 mb-1.5">Password</label>
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="input" placeholder="At least 6 characters" minLength={6} required />
        </div>
        <button type="submit" disabled={loading}
          className="btn-primary w-full py-2.5 text-sm flex items-center justify-center gap-2 disabled:opacity-60">
          {loading
            ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating...</>
            : <><UserPlus className="w-4 h-4" />Create Account</>}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-content-3">
        Already have an account?{" "}
        <Link href="/login" className="text-brand-500 hover:text-brand-600 font-semibold">Sign in</Link>
      </p>
    </>
  );
}
