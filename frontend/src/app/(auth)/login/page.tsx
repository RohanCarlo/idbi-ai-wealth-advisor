"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { LogIn } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2 className="text-xl font-bold text-content mb-1">Welcome back</h2>
      <p className="text-content-3 text-sm mb-5">Sign in to your account</p>

      <div className="mb-5 p-3 rounded-xl text-sm font-medium border"
        style={{ background: "var(--outline-2)", borderColor: "var(--outline)", color: "var(--content-3)" }}>
        Demo: <span className="text-brand-500 font-semibold">rahul@demo.com</span> /{" "}
        <span className="text-brand-500 font-semibold">demo123</span>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 rounded-xl border border-red-500/20 text-sm text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-content-2 mb-1.5">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="input" placeholder="you@example.com" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-content-2 mb-1.5">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            className="input" placeholder="••••••••" required />
        </div>
        <button type="submit" disabled={loading}
          className="btn-primary w-full py-2.5 text-sm flex items-center justify-center gap-2 disabled:opacity-60">
          {loading
            ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Signing in...</>
            : <><LogIn className="w-4 h-4" />Sign In</>}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-content-3">
        No account?{" "}
        <Link href="/register" className="text-brand-500 hover:text-brand-600 font-semibold">
          Create one
        </Link>
      </p>
    </>
  );
}
