"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { analyticsApi, transactionsApi } from "@/services/api";
import { AnalyticsSummary, FinancialHealthScore, Transaction, PageResponse } from "@/types";
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip,
  ResponsiveContainer, LineChart, Line, CartesianGrid, Legend,
} from "recharts";
import { Plus, RefreshCw, Trash2 } from "lucide-react";
import { format } from "date-fns";
import AddTransactionModal from "@/features/transactions/AddTransactionModal";

const COLORS = ["#00836c", "#f58220", "#10b981", "#ef4444", "#8b5cf6", "#ec4899", "#0ea5e9", "#84cc16"];

function ScoreBar({ label, value }: { label: string; value: number }) {
  const color = value >= 70 ? "bg-emerald-500" : value >= 40 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium text-gray-900">{value}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full">
        <div className={`h-2 ${color} rounded-full`} style={{ width: `${Math.min(100, value)}%` }} />
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const queryClient = useQueryClient();
  const [showAddTx, setShowAddTx] = useState(false);
  const [page, setPage] = useState(0);

  const { data: summary } = useQuery<AnalyticsSummary>({
    queryKey: ["analytics-summary"],
    queryFn: () => analyticsApi.getSummary().then((r) => r.data.data),
  });

  const { data: score } = useQuery<FinancialHealthScore>({
    queryKey: ["financial-score"],
    queryFn: () => analyticsApi.getFinancialScore().then((r) => r.data.data),
  });

  const { data: txPage } = useQuery<PageResponse<Transaction>>({
    queryKey: ["transactions", page],
    queryFn: () => transactionsApi.getAll(page, 15).then((r) => r.data.data),
  });

  const recalculate = useMutation({
    mutationFn: () => analyticsApi.recalculateScore(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["financial-score"] });
      queryClient.invalidateQueries({ queryKey: ["analytics-summary"] });
    },
  });

  const deleteTx = useMutation({
    mutationFn: (id: string) => transactionsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["analytics-summary"] });
    },
  });

  const transactions: Transaction[] = txPage?.content ?? [];

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500 mt-0.5">Your complete financial picture</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => recalculate.mutate()}
            disabled={recalculate.isPending}
            className="flex items-center gap-2 text-sm text-gray-600 border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
            <RefreshCw className={`w-4 h-4 ${recalculate.isPending ? "animate-spin" : ""}`} />
            Recalculate Score
          </button>
          <button onClick={() => setShowAddTx(true)}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" /> Add Transaction
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Health score */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">Health Score</h2>
            <div className="text-3xl font-bold text-brand-600">{score?.score ?? "—"}</div>
          </div>
          <div className="space-y-3">
            <ScoreBar label="Savings Rate" value={Number(score?.savingsRate ?? 0)} />
            <ScoreBar label="Spending Discipline" value={score?.spendingDisciplineScore ?? 0} />
            <ScoreBar label="Income Stability" value={score?.incomeStabilityScore ?? 0} />
            <ScoreBar label="Investment Diversity" value={score?.investmentDiversityScore ?? 0} />
            <ScoreBar
              label="Emergency Fund"
              value={Math.round(Math.min(100, ((score?.emergencyFundMonths ?? 0) / 6) * 100))}
            />
          </div>
          <p className="text-xs text-gray-400">
            Emergency fund: {score?.emergencyFundMonths ?? 0} / 6 months
          </p>
        </div>

        {/* Income vs Expenses bar chart */}
        <div className="card p-6 col-span-2">
          <h2 className="font-semibold text-gray-800 mb-1">Income vs Expenses</h2>
          <p className="text-xs text-gray-400 mb-4">Last 6 months</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={summary?.monthlyTrends ?? []} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => [`₹${Number(v).toLocaleString("en-IN")}`, ""]} />
              <Legend />
              <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} name="Income" />
              <Bar dataKey="expenses" fill="#f58220" radius={[4, 4, 0, 0]} name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Spending by category */}
        <div className="card p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Spending by Category (This Month)</h2>
          {summary?.spendingByCategory && summary.spendingByCategory.length > 0 ? (
            <div className="flex items-start gap-4">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie data={summary.spendingByCategory.slice(0, 8)} dataKey="amount"
                    cx="50%" cy="50%" innerRadius={40} outerRadius={70}>
                    {summary.spendingByCategory.slice(0, 8).map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => [`₹${Number(v).toLocaleString("en-IN")}`, ""]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 flex-1 min-w-0">
                {summary.spendingByCategory.slice(0, 7).map((cat, i) => (
                  <div key={cat.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-gray-600 truncate">{cat.name}</span>
                    </div>
                    <div className="flex-shrink-0 ml-2 text-right">
                      <span className="font-medium text-gray-900">₹{Number(cat.amount).toLocaleString("en-IN")}</span>
                      <span className="text-gray-400 text-xs ml-1">{Number(cat.percentage).toFixed(0)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400 py-8 text-center">No spending data this month</p>
          )}
        </div>

        {/* Savings trend line */}
        <div className="card p-6">
          <h2 className="font-semibold text-gray-800 mb-1">Savings Trend</h2>
          <p className="text-xs text-gray-400 mb-4">Monthly savings over time</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={summary?.monthlyTrends ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => [`₹${Number(v).toLocaleString("en-IN")}`, "Savings"]} />
              <Line type="monotone" dataKey="savings" stroke="#00836c" strokeWidth={2}
                dot={{ fill: "#00836c", r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Transactions table */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">All Transactions</h2>
          <div className="text-xs text-gray-400">{txPage?.totalElements ?? 0} total</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Merchant</th>
                <th className="text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="text-right py-2 px-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="text-center py-2 px-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50 group">
                  <td className="py-2.5 px-3 text-gray-500">{format(new Date(tx.transactionDate), "dd MMM yyyy")}</td>
                  <td className="py-2.5 px-3 font-medium text-gray-800">{tx.merchant || "—"}</td>
                  <td className="py-2.5 px-3 text-gray-500">{tx.categoryName || "—"}</td>
                  <td className={`py-2.5 px-3 text-right font-semibold ${tx.type === "CREDIT" ? "text-emerald-600" : "text-gray-700"}`}>
                    {tx.type === "CREDIT" ? "+" : "-"}₹{Number(tx.amount).toLocaleString("en-IN")}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      tx.type === "CREDIT" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <button onClick={() => deleteTx.mutate(tx.id)}
                      className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {txPage && txPage.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
              className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-40 transition-colors">
              ← Previous
            </button>
            <span className="text-xs text-gray-400">Page {page + 1} of {txPage.totalPages}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={page >= txPage.totalPages - 1}
              className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-40 transition-colors">
              Next →
            </button>
          </div>
        )}
      </div>

      {showAddTx && (
        <AddTransactionModal
          onClose={() => setShowAddTx(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
            queryClient.invalidateQueries({ queryKey: ["analytics-summary"] });
            setShowAddTx(false);
          }}
        />
      )}
    </div>
  );
}
