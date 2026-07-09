import { Wallet } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-brand flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white/10 backdrop-blur rounded-2xl mb-4 border border-white/20">
            <Wallet className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">IDBI Wealth Advisor</h1>
          <p className="text-white/60 text-sm mt-1">AI-Powered Financial Guidance</p>
        </div>
        <div className="rounded-2xl shadow-2xl p-8 border border-white/10"
          style={{ background: "var(--surface-card)" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
