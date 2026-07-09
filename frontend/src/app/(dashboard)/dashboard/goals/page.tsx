"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { goalsApi } from "@/services/api";
import { Goal } from "@/types";
import { Calendar, TrendingUp, Plus, X, Trash2 } from "lucide-react";
import { differenceInDays } from "date-fns";

function formatINR(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

function GoalCard({ goal, onDelete }: { goal: Goal; onDelete: (id: string) => void }) {
  const pct = Math.min(100, (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100);
  const daysLeft = differenceInDays(new Date(goal.deadline), new Date());
  const remaining = Number(goal.targetAmount) - Number(goal.currentAmount);
  const monthlyNeeded = daysLeft > 0 ? remaining / (daysLeft / 30) : 0;
  const barColor = pct >= 75 ? "#10b981" : pct >= 40 ? "#00836c" : "#f58220";

  return (
    <div className="card p-5 group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-content">{goal.name}</h3>
          {goal.description && <p className="text-xs text-content-4 mt-0.5">{goal.description}</p>}
        </div>
        <div className="flex items-center gap-2 ml-2">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            goal.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-500" : "text-content-4"}`}
            style={goal.status !== "ACTIVE" ? { background: "var(--outline-2)" } : undefined}>
            {goal.status}
          </span>
          <button onClick={() => onDelete(goal.id)}
            className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-500 transition-all">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-content-3">Progress</span>
          <span className="font-semibold text-content">{pct.toFixed(1)}%</span>
        </div>
        <div className="h-2 rounded-full" style={{ background: "var(--outline)" }}>
          <div className="h-2 rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, background: barColor }} />
        </div>
        <div className="flex justify-between text-xs text-content-4 mt-1">
          <span>{formatINR(Number(goal.currentAmount))} saved</span>
          <span>{formatINR(Number(goal.targetAmount))} target</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 pt-3 border-t border-outline text-center">
        <div>
          <div className="flex items-center justify-center mb-1 text-content-4">
            <Calendar className="w-3 h-3" />
          </div>
          <div className="text-sm font-bold text-content">{Math.max(0, daysLeft)}d</div>
          <div className="text-xs text-content-4">days left</div>
        </div>
        <div>
          <div className="flex items-center justify-center mb-1 text-content-4">
            <TrendingUp className="w-3 h-3" />
          </div>
          <div className="text-sm font-bold text-content">{formatINR(remaining)}</div>
          <div className="text-xs text-content-4">remaining</div>
        </div>
        <div>
          <div className="text-sm font-bold text-brand-500">{formatINR(monthlyNeeded)}</div>
          <div className="text-xs text-content-4">/ month</div>
        </div>
      </div>
    </div>
  );
}

function AddGoalModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({
    name: "", description: "", targetAmount: "", currentAmount: "",
    deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await goalsApi.create({
        name: form.name,
        description: form.description || undefined,
        targetAmount: parseFloat(form.targetAmount),
        currentAmount: form.currentAmount ? parseFloat(form.currentAmount) : 0,
        deadline: form.deadline,
      });
      onSuccess();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg || "Failed to create goal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="rounded-2xl shadow-2xl w-full max-w-md animate-scale-in border border-outline"
        style={{ background: "var(--surface-elevated)" }}>
        <div className="flex items-center justify-between p-5 border-b border-outline">
          <h2 className="text-lg font-semibold text-content">New Financial Goal</h2>
          <button onClick={onClose} className="text-content-4 hover:text-content transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl">{error}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-content-2 mb-1.5">Goal Name</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input" placeholder="e.g. Buy a Car, Europe Vacation..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-content-2 mb-1.5">Description</label>
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="input" placeholder="Optional" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-content-2 mb-1.5">Target Amount (₹)</label>
              <input type="number" required min="1" step="1" value={form.targetAmount}
                onChange={(e) => setForm({ ...form, targetAmount: e.target.value })}
                className="input" placeholder="500000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-content-2 mb-1.5">Already Saved (₹)</label>
              <input type="number" min="0" step="1" value={form.currentAmount}
                onChange={(e) => setForm({ ...form, currentAmount: e.target.value })}
                className="input" placeholder="0" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-content-2 mb-1.5">Target Date</label>
            <input type="date" required value={form.deadline}
              min={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              className="input" />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 py-2.5 text-sm">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 py-2.5 text-sm disabled:opacity-60">
              {loading ? "Creating..." : "Create Goal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function GoalsPage() {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);

  const { data: goals = [], isLoading } = useQuery<Goal[]>({
    queryKey: ["goals"],
    queryFn: () => goalsApi.getAll().then((r) => r.data.data),
  });

  const deleteGoal = useMutation({
    mutationFn: (id: string) => goalsApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["goals"] }),
  });

  const active = goals.filter((g) => g.status === "ACTIVE");
  const total = goals.reduce((s, g) => s + Number(g.targetAmount), 0);
  const saved = goals.reduce((s, g) => s + Number(g.currentAmount), 0);

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-content">Financial Goals</h1>
          <p className="text-sm text-content-3 mt-0.5">{active.length} active goal{active.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2 px-4 py-2 text-sm">
          <Plus className="w-4 h-4" /> New Goal
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Target", value: formatINR(total), color: "text-content" },
          { label: "Total Saved", value: formatINR(saved), color: "text-brand-500" },
          { label: "Overall Progress", value: `${total > 0 ? ((saved / total) * 100).toFixed(1) : "0"}%`, color: "text-emerald-500" },
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-5">
            <div className="text-xs text-content-4 uppercase tracking-wider mb-1.5">{label}</div>
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="h-4 rounded-lg w-1/2 mb-4" style={{ background: "var(--outline)" }} />
              <div className="h-2 rounded-full mb-2" style={{ background: "var(--outline-2)" }} />
              <div className="h-8 rounded-lg" style={{ background: "var(--outline-2)" }} />
            </div>
          ))}
        </div>
      ) : goals.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-content-3 mb-4">No goals yet. Create your first financial goal!</p>
          <button onClick={() => setShowAdd(true)}
            className="btn-primary inline-flex items-center gap-2 px-4 py-2 text-sm">
            <Plus className="w-4 h-4" /> Create Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} onDelete={(id) => deleteGoal.mutate(id)} />
          ))}
        </div>
      )}

      {showAdd && (
        <AddGoalModal
          onClose={() => setShowAdd(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["goals"] });
            setShowAdd(false);
          }}
        />
      )}
    </div>
  );
}
