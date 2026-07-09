"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { chatApi, analyticsApi, goalsApi } from "@/services/api";
import { AnalyticsSummary, FinancialHealthScore, Goal, ChatMessage } from "@/types";
import { Send, User as UserIcon } from "lucide-react";
import AryaAvatar from "@/components/AryaAvatar";

const QUICK_PROMPTS = [
  "How is my financial health?",
  "Can I afford a vacation next month?",
  "How should I invest my savings?",
  "Am I on track for my goals?",
  "Where am I overspending?",
  "How can I build my emergency fund faster?",
];

export default function ChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "ASSISTANT",
      content: `Hi ${user?.name?.split(" ")[0] ?? "there"}! I'm Arya, your AI financial advisor. I've analyzed your financial data and I'm ready to help you make smarter money decisions. What would you like to know?`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}`);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: summary } = useQuery<AnalyticsSummary>({
    queryKey: ["analytics-summary"],
    queryFn: () => analyticsApi.getSummary().then((r) => r.data.data),
  });

  const { data: score } = useQuery<FinancialHealthScore>({
    queryKey: ["financial-score"],
    queryFn: () => analyticsApi.getFinancialScore().then((r) => r.data.data),
  });

  const { data: goals = [] } = useQuery<Goal[]>({
    queryKey: ["goals"],
    queryFn: () => goalsApi.getAll().then((r) => r.data.data),
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const buildUserContext = () => ({
    name: user?.name ?? "User",
    balance: summary?.accountBalance ?? 0,
    monthly_income: summary?.monthlyIncome ?? 0,
    monthly_expenses: summary?.monthlyExpenses ?? 0,
    monthly_savings: summary?.monthlySavings ?? 0,
    health_score: score?.score ?? null,
    risk_tolerance: "MEDIUM",
    savings_rate: summary?.savingsRate ?? 0,
    debt_ratio: score?.debtRatio ?? 0,
    emergency_fund_months: score?.emergencyFundMonths ?? 0,
    goals: goals.map((g) => ({
      name: g.name,
      current: Number(g.currentAmount),
      target: Number(g.targetAmount),
      deadline: g.deadline,
    })),
    top_categories: (summary?.spendingByCategory ?? []).slice(0, 5).map((c) => ({
      name: c.name,
      amount: Number(c.amount),
    })),
  });

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: ChatMessage = { role: "USER", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const res = await chatApi.send({
        user_context: buildUserContext(),
        conversation_history: messages.map((m) => ({ role: m.role, content: m.content })),
        message: text,
        session_id: sessionId,
      });
      const aiResponse = res.data?.data?.response ?? res.data?.response;
      setMessages((prev) => [...prev, { role: "ASSISTANT", content: aiResponse }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "ASSISTANT", content: "I'm having trouble connecting right now. Please try again in a moment." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-48px)]">
      {/* Arya sidebar */}
      <div className="w-56 flex flex-col items-center py-8 px-4 gap-4 flex-shrink-0 border-r border-outline"
        style={{ background: "var(--surface-sidebar)" }}>
        <AryaAvatar speaking={loading} size="lg" />
        <div className="text-center">
          <div className="font-semibold text-content">Arya</div>
          <div className="text-xs text-content-4">AI Financial Advisor</div>
          <div className="flex items-center justify-center gap-1 mt-1">
            <div className={`w-1.5 h-1.5 rounded-full ${loading ? "bg-amber-400 animate-pulse" : "bg-emerald-400"}`} />
            <span className="text-xs text-content-4">{loading ? "Thinking..." : "Online"}</span>
          </div>
        </div>

        {summary && (
          <div className="w-full mt-1 space-y-2">
            <div className="text-xs font-semibold text-content-4 uppercase tracking-wider">Your Summary</div>
            {[
              { label: "Balance", value: `₹${Number(summary.accountBalance).toLocaleString("en-IN")}` },
              { label: "Score", value: `${score?.score ?? "—"}/100` },
              { label: "Savings", value: `${Number(summary.savingsRate).toFixed(1)}%` },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-xs">
                <span className="text-content-4">{label}</span>
                <span className="font-semibold text-content">{value}</span>
              </div>
            ))}
          </div>
        )}

        <div className="w-full mt-1 space-y-1">
          <div className="text-xs font-semibold text-content-4 uppercase tracking-wider mb-2">Ask me</div>
          {QUICK_PROMPTS.slice(0, 4).map((p) => (
            <button key={p} onClick={() => sendMessage(p)}
              className="w-full text-left text-xs px-2.5 py-2 rounded-xl transition-all leading-snug text-content-3 hover:text-brand-500 hover:bg-outline"
              style={{ background: "var(--outline-2)" }}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col overflow-hidden" style={{ background: "var(--surface)" }}>
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 animate-fade-in ${msg.role === "USER" ? "flex-row-reverse" : ""}`}>
              {msg.role === "ASSISTANT"
                ? <AryaAvatar size="sm" speaking={loading && i === messages.length - 1} />
                : (
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "var(--outline)" }}>
                    <UserIcon className="w-4 h-4 text-content-4" />
                  </div>
                )}
              <div className={`max-w-[70%] ${msg.role === "USER" ? "items-end" : "items-start"} flex flex-col`}>
                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "USER"
                    ? "bg-brand-600 text-white rounded-tr-sm"
                    : "rounded-tl-sm shadow-sm border border-outline"}`}
                  style={msg.role === "ASSISTANT" ? {
                    background: "var(--surface-card)",
                    color: "var(--content)",
                  } : undefined}>
                  {msg.content}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 animate-fade-in">
              <AryaAvatar size="sm" speaking />
              <div className="rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-outline"
                style={{ background: "var(--surface-card)" }}>
                <div className="flex gap-1 items-center">
                  {[0, 150, 300].map((delay) => (
                    <div key={delay} className="w-2 h-2 bg-brand-500 rounded-full animate-bounce"
                      style={{ animationDelay: `${delay}ms` }} />
                  ))}
                  <span className="text-xs text-content-4 ml-2">Arya is thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t border-outline p-4" style={{ background: "var(--surface-card)" }}>
          <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} className="flex gap-2">
            <input value={input} onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Arya about your finances..."
              className="input flex-1" />
            <button type="submit" disabled={!input.trim() || loading}
              className="btn-primary w-10 h-10 flex items-center justify-center flex-shrink-0 disabled:opacity-50">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
