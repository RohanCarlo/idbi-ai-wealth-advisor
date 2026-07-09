"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { analyticsApi, goalsApi, transactionsApi, recommendationsApi } from "@/services/api";
import { AnalyticsSummary, FinancialHealthScore, Goal, Transaction, Recommendation } from "@/types";
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Sparkles, ChevronRight } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

function formatINR(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

function HealthScoreRing({ score }: { score: number }) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? "#10b981" : score >= 60 ? "#22c55e" : score >= 40 ? "#f59e0b" : "#ef4444";
  const label = score >= 80 ? "Excellent" : score >= 60 ? "Good" : score >= 40 ? "Fair" : "Poor";

  return (
    <div className="flex flex-col items-center">
      <div className="relative inline-flex items-center justify-center">
        <svg width="120" height="120" className="-rotate-90">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="var(--outline)" strokeWidth="10" />
          <circle cx="60" cy="60" r={radius} fill="none" stroke={color} strokeWidth="10"
            strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s ease" }} />
        </svg>
        <div className="absolute text-center">
          <div className="text-3xl font-bold text-content">{score}</div>
          <div className="text-xs text-content-4">/ 100</div>
        </div>
      </div>
      <div className="text-xs font-semibold mt-1.5 px-2.5 py-0.5 rounded-full"
        style={{ color, background: `${color}20` }}>{label}</div>
    </div>
  );
}

function StatCard({ label, value, sub, trend, color }: {
  label: string; value: string; sub?: string; trend?: "up" | "down" | "neutral"; color: string;
}) {
  const trendColor = trend === "up" ? "text-emerald-500" : trend === "down" ? "text-red-400" : "text-content-4";
  return (
    <div className={`stat-card ${color}`}>
      <div className="text-xs font-semibold text-content-3 uppercase tracking-wider mb-3">{label}</div>
      <div className="text-2xl font-bold text-content mb-1.5">{value}</div>
      {sub && (
        <div className={`flex items-center gap-1 text-xs font-medium ${trendColor}`}>
          {trend === "up" && <TrendingUp className="w-3 h-3" />}
          {trend === "down" && <TrendingDown className="w-3 h-3" />}
          {sub}
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();

  const { data: summary, isLoading: summaryLoading } = useQuery<AnalyticsSummary>({
    queryKey: ["analytics-summary"],
    queryFn: () => analyticsApi.getSummary().then((r) => r.data.data),
  });

  const { data: scoreData } = useQuery<FinancialHealthScore>({
    queryKey: ["financial-score"],
    queryFn: () => analyticsApi.getFinancialScore().then((r) => r.data.data),
  });

  const { data: goalsData } = useQuery<Goal[]>({
    queryKey: ["goals"],
    queryFn: () => goalsApi.getAll().then((r) => r.data.data),
  });

  const { data: txData } = useQuery({
    queryKey: ["transactions", 0, 5],
    queryFn: () => transactionsApi.getAll(0, 5).then((r) => r.data.data),
  });

  const { data: recommendations } = useQuery<Recommendation[]>({
    queryKey: ["recommendations"],
    queryFn: () => recommendationsApi.getAll().then((r) => r.data.data),
  });

  const transactions: Transaction[] = txData?.content ?? [];
  const goals: Goal[] = goalsData ?? [];
  const incPct = summary?.incomeChangePercent ?? 0;
  const expPct = summary?.expenseChangePercent ?? 0;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-content">
            {greeting},{" "}
            <span className="gradient-text">{user?.name.split(" ")[0]}</span> 👋
          </h1>
          <p className="text-sm text-content-3 mt-0.5">Here&apos;s your financial snapshot for today</p>
        </div>
        <Link href="/dashboard/chat" className="btn-primary flex items-center gap-2 px-4 py-2.5 text-sm">
          <Sparkles className="w-4 h-4" /> Ask Arya
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Monthly Income" color="green"
          value={summaryLoading ? "—" : formatINR(summary?.monthlyIncome ?? 0)}
          sub={incPct !== 0 ? `${Math.abs(incPct).toFixed(1)}% vs last month` : "no change"}
          trend={incPct > 0 ? "up" : incPct < 0 ? "down" : "neutral"} />
        <StatCard label="Monthly Expenses" color="red"
          value={summaryLoading ? "—" : formatINR(summary?.monthlyExpenses ?? 0)}
          sub={expPct !== 0 ? `${Math.abs(expPct).toFixed(1)}% vs last month` : "no change"}
          trend={expPct > 0 ? "down" : expPct < 0 ? "up" : "neutral"} />
        <StatCard label="Monthly Savings" color="blue"
          value={summaryLoading ? "—" : formatINR(summary?.monthlySavings ?? 0)}
          sub={summary ? `${Number(summary.savingsRate).toFixed(1)}% savings rate` : undefined}
          trend="up" />
        <StatCard label="Account Balance" color="purple"
          value={summaryLoading ? "—" : formatINR(summary?.accountBalance ?? 0)} />
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Health Score */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-content">Financial Health Score</h2>
            <Link href="/dashboard/analytics"
              className="text-xs text-brand-500 hover:text-brand-600 flex items-center gap-0.5 font-medium">
              Full breakdown <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <HealthScoreRing score={scoreData?.score ?? 0} />
            <div className="space-y-2.5 text-sm flex-1">
              {[
                { label: "Savings Rate", value: `${scoreData?.savingsRate ?? 0}%` },
                { label: "Debt Ratio", value: `${scoreData?.debtRatio ?? 0}%` },
                { label: "Emergency Fund", value: `${scoreData?.emergencyFundMonths ?? 0} mo` },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-content-3">{label}</span>
                  <span className="font-semibold text-content">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Goals */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-content">Financial Goals</h2>
            <Link href="/dashboard/goals"
              className="text-xs text-brand-500 hover:text-brand-600 flex items-center gap-0.5 font-medium">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-4">
            {goals.slice(0, 3).map((goal) => {
              const pct = Math.min(100, (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100);
              const barColor = pct >= 75 ? "#10b981" : pct >= 40 ? "#00836c" : "#f58220";
              return (
                <div key={goal.id}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium text-content truncate mr-2">{goal.name}</span>
                    <span className="text-content-3 flex-shrink-0 text-xs font-semibold">{pct.toFixed(0)}%</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: "var(--outline)" }}>
                    <div className="h-1.5 rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: barColor }} />
                  </div>
                  <div className="flex justify-between text-xs text-content-4 mt-0.5">
                    <span>{formatINR(Number(goal.currentAmount))}</span>
                    <span>{formatINR(Number(goal.targetAmount))}</span>
                  </div>
                </div>
              );
            })}
            {goals.length === 0 && <p className="text-sm text-content-4 text-center py-4">No goals yet</p>}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-content">Recent Transactions</h2>
            <Link href="/dashboard/analytics"
              className="text-xs text-brand-500 hover:text-brand-600 flex items-center gap-0.5 font-medium">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  tx.type === "CREDIT" ? "bg-emerald-500/10" : "bg-red-500/10"}`}>
                  {tx.type === "CREDIT"
                    ? <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                    : <ArrowDownRight className="w-4 h-4 text-red-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-content truncate">{tx.merchant || tx.description}</div>
                  <div className="text-xs text-content-4">
                    {format(new Date(tx.transactionDate), "MMM d")} · {tx.categoryName}
                  </div>
                </div>
                <div className={`text-sm font-bold flex-shrink-0 ${
                  tx.type === "CREDIT" ? "text-emerald-500" : "text-content-2"}`}>
                  {tx.type === "CREDIT" ? "+" : "-"}₹{Number(tx.amount).toLocaleString("en-IN")}
                </div>
              </div>
            ))}
            {transactions.length === 0 && <p className="text-sm text-content-4 text-center py-4">No transactions yet</p>}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-2 gap-4">
        {summary?.insights && summary.insights.length > 0 && (
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-brand-500" />
              <h2 className="text-sm font-semibold text-content">AI Insights</h2>
            </div>
            <div className="space-y-2">
              {summary.insights.map((insight, i) => (
                <div key={i} className="flex items-start gap-2.5 text-sm rounded-xl p-3"
                  style={{ background: "var(--outline-2)" }}>
                  <Sparkles className="w-3.5 h-3.5 text-brand-500 flex-shrink-0 mt-0.5" />
                  <span className="text-content-2 leading-relaxed">{insight}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {recommendations && recommendations.filter(r => r.status === "ACTIVE").length > 0 && (
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-500" />
                <h2 className="text-sm font-semibold text-content">Top Recommendations</h2>
              </div>
              <Link href="/dashboard/recommendations"
                className="text-xs text-brand-500 hover:text-brand-600 flex items-center gap-0.5 font-medium">
                View all <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-2.5">
              {recommendations.filter(r => r.status === "ACTIVE").slice(0, 3).map((rec) => (
                <div key={rec.id} className="flex items-start gap-3 p-3 rounded-xl"
                  style={{ background: "var(--outline-2)" }}>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-content">{rec.title}</div>
                    {rec.suggestedMonthlyAmount && (
                      <div className="text-xs text-content-3 mt-0.5">
                        ₹{Number(rec.suggestedMonthlyAmount).toLocaleString("en-IN")}/mo ·{" "}
                        <span className="text-emerald-500 font-semibold">{rec.expectedReturn}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
