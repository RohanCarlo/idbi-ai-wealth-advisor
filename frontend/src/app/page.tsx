import Link from "next/link";
import { ArrowRight, TrendingUp, ShieldCheck, Sparkles, Target, BarChart3, MessageSquare, Wallet } from "lucide-react";

const features = [
  { icon: Sparkles, title: "AI Financial Advisor", desc: "Chat with Arya, your personal AI advisor trained on Indian financial instruments — SIP, ELSS, PPF, NPS and more.", color: "from-violet-500 to-purple-600" },
  { icon: BarChart3, title: "Real-time Analytics", desc: "Live income/expense tracking, 6-month trends, spending category breakdown, and monthly savings insights.", color: "from-blue-500 to-cyan-600" },
  { icon: TrendingUp, title: "Investment Recommendations", desc: "Personalized portfolio suggestions based on your risk profile, goals, and current savings rate.", color: "from-emerald-500 to-teal-600" },
  { icon: Target, title: "Goal Planning", desc: "Set financial goals and get AI-driven feasibility analysis with the right investment instruments.", color: "from-orange-500 to-amber-600" },
  { icon: ShieldCheck, title: "Health Score", desc: "A composite 0–100 financial health score tracking savings rate, debt ratio, emergency fund, and investment diversity.", color: "from-rose-500 to-pink-600" },
  { icon: MessageSquare, title: "Smart Notifications", desc: "Proactive alerts for low savings rate, milestone achievements, and monthly analysis updates.", color: "from-brand-400 to-brand-700" },
];

const stats = [
  { value: "72/100", label: "Avg Health Score" },
  { value: "₹85K+", label: "Tracked Balance" },
  { value: "36+", label: "Transactions Analyzed" },
  { value: "7", label: "Investment Instruments" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--surface)", color: "var(--content)" }}>
      {/* Nav */}
      <nav className="border-b px-6 py-4 flex items-center justify-between max-w-6xl mx-auto"
        style={{ borderColor: "var(--outline)", background: "var(--surface-card)" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center shadow-md">
            <Wallet className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <span className="font-bold text-content">AI Wealth Advisor</span>
            <span className="ml-2 text-xs text-content-4 font-normal">by IDBI Bank</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-content-3 hover:text-content transition-colors font-medium">Sign in</Link>
          <Link href="/login"
            className="btn-primary flex items-center gap-1.5 px-4 py-2 text-sm">
            Try Demo <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center relative">
        {/* Background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
          <div className="absolute top-20 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6 border"
            style={{ background: "var(--outline-2)", borderColor: "var(--outline)", color: "var(--content-3)" }}>
            <Sparkles className="w-3.5 h-3.5 text-brand-500" />
            IDBI Bank Hackathon 2026 · AI Wealth Management
          </div>

          <h1 className="text-5xl font-bold leading-tight mb-6">
            Your Personal<br />
            <span className="gradient-text">AI Financial Advisor</span>
          </h1>

          <p className="text-lg text-content-3 max-w-2xl mx-auto mb-10 leading-relaxed">
            Meet Arya — an intelligent avatar-based wealth advisor that analyzes your transactions,
            tracks your goals, and gives personalized investment recommendations tailored for Indian investors.
          </p>

          <div className="flex flex-col items-center gap-4">
            <Link href="/login"
              className="btn-primary flex items-center gap-2 px-7 py-3.5 text-sm font-semibold">
              Try the Demo <ArrowRight className="w-4 h-4" />
            </Link>
            <div className="text-xs text-content-4">
              Demo credentials:{" "}
              <code className="px-1.5 py-0.5 rounded text-content-3 font-mono text-xs"
                style={{ background: "var(--outline-2)" }}>rahul@demo.com</code>
              {" "}·{" "}
              <code className="px-1.5 py-0.5 rounded text-content-3 font-mono text-xs"
                style={{ background: "var(--outline-2)" }}>demo123</code>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-gradient-brand py-12">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-4 gap-8 text-center text-white">
          {stats.map(({ value, label }) => (
            <div key={label} className="animate-fade-in">
              <div className="text-3xl font-bold tracking-tight">{value}</div>
              <div className="text-white/70 text-sm mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-content text-center mb-3">Everything you need</h2>
        <p className="text-content-3 text-center mb-12">Built for Indian investors, powered by cutting-edge AI</p>

        <div className="grid grid-cols-3 gap-5">
          {features.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="card p-6 hover:scale-[1.02] transition-transform duration-200 group cursor-default">
              <div className={`w-10 h-10 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform duration-200`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-semibold text-content mb-2">{title}</h3>
              <p className="text-sm text-content-3 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-brand py-16 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Ready to meet Arya?</h2>
        <p className="text-white/70 mb-8 text-sm">Log in with demo credentials and explore the full experience</p>
        <Link href="/login"
          className="bg-white text-brand-700 hover:bg-brand-50 px-8 py-3 rounded-xl font-semibold transition-colors inline-flex items-center gap-2 shadow-xl">
          Get Started <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      <footer className="text-center text-xs text-content-4 py-6 border-t border-outline">
        Built for IDBI Bank Hackathon 2026 · AI Wealth Advisor (Avatar-Based)
      </footer>
    </div>
  );
}
