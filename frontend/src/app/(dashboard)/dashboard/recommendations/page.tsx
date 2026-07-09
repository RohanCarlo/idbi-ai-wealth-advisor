"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { recommendationsApi } from "@/services/api";
import { Recommendation } from "@/types";
import {
  TrendingUp, ShieldCheck, PiggyBank, Target, Landmark,
  RefreshCw, Check, X, Sparkles, ChevronDown, ChevronUp,
} from "lucide-react";

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string; bg: string; label: string }> = {
  INVESTMENT: { icon: <TrendingUp className="w-5 h-5" />, color: "text-brand-500", bg: "bg-brand-500/10", label: "Investment" },
  TAX_SAVING: { icon: <Landmark className="w-5 h-5" />, color: "text-emerald-500", bg: "bg-emerald-500/10", label: "Tax Saving" },
  SAVINGS: { icon: <PiggyBank className="w-5 h-5" />, color: "text-amber-500", bg: "bg-amber-500/10", label: "Savings" },
  RETIREMENT: { icon: <ShieldCheck className="w-5 h-5" />, color: "text-purple-500", bg: "bg-purple-500/10", label: "Retirement" },
  GOAL: { icon: <Target className="w-5 h-5" />, color: "text-rose-500", bg: "bg-rose-500/10", label: "Goal" },
  DEBT: { icon: <ShieldCheck className="w-5 h-5" />, color: "text-orange-500", bg: "bg-orange-500/10", label: "Debt" },
};

const INSTRUMENT_LABEL: Record<string, string> = {
  LIQUID_FUND: "Liquid Fund",
  ELSS: "ELSS (Tax Saver MF)",
  INDEX_FUND: "Nifty 50 Index Fund",
  EQUITY_MF: "Equity Mutual Fund",
  DEBT_FUND: "Debt Mutual Fund",
  HYBRID_FUND: "Hybrid Fund",
  PPF: "PPF",
  NPS: "NPS",
};

function RecommendationCard({ rec, onAccept, onDismiss, isPending }: {
  rec: Recommendation;
  onAccept: (id: string) => void;
  onDismiss: (id: string) => void;
  isPending?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const cfg = TYPE_CONFIG[rec.type] ?? TYPE_CONFIG.INVESTMENT;
  const accepted = rec.status === "ACCEPTED";
  const dismissed = rec.status === "DISMISSED";

  return (
    <div className="card p-5 transition-all duration-200"
      style={{
        borderColor: accepted ? "rgb(16 185 129 / 0.3)" : "var(--outline)",
        background: accepted ? "rgb(16 185 129 / 0.04)" : dismissed ? undefined : "var(--surface-card)",
        opacity: dismissed ? 0.5 : 1,
      }}>
      <div className="flex gap-4">
        <div className={`w-10 h-10 rounded-xl ${cfg.bg} ${cfg.color} flex items-center justify-center flex-shrink-0`}>
          {cfg.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                {cfg.label}
              </span>
              <span className="text-xs text-content-4">{INSTRUMENT_LABEL[rec.instrument] ?? rec.instrument}</span>
            </div>
            {accepted && (
              <span className="text-xs text-emerald-500 font-medium flex items-center gap-1 flex-shrink-0">
                <Check className="w-3 h-3" /> In Plan
              </span>
            )}
          </div>
          <h3 className="font-semibold text-content mt-1.5">{rec.title}</h3>

          <div className="flex gap-5 mt-2">
            {rec.suggestedMonthlyAmount && (
              <div>
                <div className="text-xs text-content-4">Monthly</div>
                <div className="text-sm font-bold text-content">
                  ₹{Number(rec.suggestedMonthlyAmount).toLocaleString("en-IN")}
                </div>
              </div>
            )}
            {rec.expectedReturn && (
              <div>
                <div className="text-xs text-content-4">Expected Return</div>
                <div className="text-sm font-bold text-emerald-500">{rec.expectedReturn}</div>
              </div>
            )}
          </div>

          <div className={`mt-2 text-sm text-content-3 leading-relaxed ${!expanded ? "line-clamp-2" : ""}`}>
            {rec.description}
          </div>
          <button onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-brand-500 hover:text-brand-600 mt-1 font-medium">
            {expanded ? <><ChevronUp className="w-3 h-3" /> Less</> : <><ChevronDown className="w-3 h-3" /> Read more</>}
          </button>
        </div>
      </div>

      {rec.status === "ACTIVE" && (
        <div className="flex gap-2 mt-4 pt-3 border-t" style={{ borderColor: "var(--outline)" }}>
          <button onClick={() => onAccept(rec.id)} disabled={isPending}
            className="btn-primary flex-1 flex items-center justify-center gap-1.5 py-2 text-sm disabled:opacity-60">
            {isPending
              ? <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Adding...</>
              : <><Check className="w-3.5 h-3.5" /> Add to My Plan</>}
          </button>
          <button onClick={() => onDismiss(rec.id)} disabled={isPending}
            className="btn-secondary px-4 py-2 text-sm disabled:opacity-50">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function RecommendationsPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "ACCEPTED">("ALL");

  const { data: recs = [], isLoading } = useQuery<Recommendation[]>({
    queryKey: ["recommendations"],
    queryFn: () => recommendationsApi.getAll().then((r) => r.data.data),
  });

  const generate = useMutation({
    mutationFn: () => recommendationsApi.generate(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["recommendations"] }),
  });

  const [statusError, setStatusError] = useState<string | null>(null);
  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      recommendationsApi.updateStatus(id, status),
    onSuccess: () => {
      setStatusError(null);
      queryClient.invalidateQueries({ queryKey: ["recommendations"] });
    },
    onError: (err: { response?: { status?: number } }) => {
      if (err?.response?.status === 401) {
        setStatusError("Session expired — please log out and log back in.");
      } else {
        setStatusError("Failed to update. Please try again.");
      }
    },
  });

  const filtered = recs.filter((r) =>
    filter === "ALL" ? r.status !== "DISMISSED" :
    filter === "ACCEPTED" ? r.status === "ACCEPTED" : r.status === "ACTIVE"
  );

  const activeCount = recs.filter((r) => r.status === "ACTIVE").length;
  const acceptedCount = recs.filter((r) => r.status === "ACCEPTED").length;
  const monthlyCommitment = recs
    .filter((r) => r.status === "ACCEPTED")
    .reduce((s, r) => s + Number(r.suggestedMonthlyAmount || 0), 0);

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-content">Investment Recommendations</h1>
          <p className="text-sm text-content-3 mt-0.5">Personalized advice based on your financial profile</p>
        </div>
        <button onClick={() => generate.mutate()} disabled={generate.isPending}
          className="btn-secondary flex items-center gap-2 px-4 py-2 text-sm">
          <RefreshCw className={`w-4 h-4 ${generate.isPending ? "animate-spin" : ""}`} />
          {generate.isPending ? "Analyzing..." : "Regenerate"}
        </button>
      </div>

      {statusError && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl flex items-center justify-between">
          {statusError}
          <button onClick={() => setStatusError(null)} className="ml-4 text-red-400 hover:text-red-300">✕</button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Recommendations", value: recs.filter(r => r.status !== "DISMISSED").length, color: "text-content" },
          { label: "Added to Plan", value: acceptedCount, color: "text-emerald-500" },
          { label: "Planned Monthly Investment", value: `₹${monthlyCommitment.toLocaleString("en-IN")}`, color: "text-brand-500",
            sub: "Tracked intent — no funds are auto-debited" },
        ].map(({ label, value, color, sub }) => (
          <div key={label} className="card p-4">
            <div className="text-xs text-content-4 mb-1">{label}</div>
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            {sub && <div className="text-[11px] text-content-4 mt-1">{sub}</div>}
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 rounded-xl p-1 w-fit border border-outline" style={{ background: "var(--outline-2)" }}>
        {(["ALL", "ACTIVE", "ACCEPTED"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
              filter === f
                ? "bg-surface-card text-content shadow-sm"
                : "text-content-3 hover:text-content"}`}>
            {f === "ALL" ? "All" : f === "ACTIVE" ? `Pending (${activeCount})` : `My Plan (${acceptedCount})`}
          </button>
        ))}
      </div>

      {/* Cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl" style={{ background: "var(--outline)" }} />
                <div className="flex-1 space-y-2">
                  <div className="h-3 rounded-lg w-1/3" style={{ background: "var(--outline)" }} />
                  <div className="h-4 rounded-lg w-3/4" style={{ background: "var(--outline)" }} />
                  <div className="h-3 rounded-lg" style={{ background: "var(--outline-2)" }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <Sparkles className="w-10 h-10 text-content-4 mx-auto mb-3" />
          <p className="text-content-3 mb-4">
            No recommendations yet. Click &quot;Regenerate&quot; to get personalized advice.
          </p>
          <button onClick={() => generate.mutate()} disabled={generate.isPending}
            className="btn-primary inline-flex items-center gap-2 px-4 py-2 text-sm">
            <Sparkles className="w-4 h-4" /> Generate Recommendations
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {filtered.map((rec) => (
            <RecommendationCard key={rec.id} rec={rec}
              isPending={updateStatus.isPending && updateStatus.variables?.id === rec.id}
              onAccept={(id) => updateStatus.mutate({ id, status: "ACCEPTED" })}
              onDismiss={(id) => updateStatus.mutate({ id, status: "DISMISSED" })} />
          ))}
        </div>
      )}
    </div>
  );
}
